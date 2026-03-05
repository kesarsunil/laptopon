import os
import hashlib
import math
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any
import pefile
import zipfile
import struct
from collections import Counter
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
import logging

try:
    import magic
except ImportError:
    magic = None
    print("Warning: python-magic not available. File type detection will be limited.")

try:
    import rarfile
except ImportError:
    rarfile = None
    print("Warning: rarfile not available. RAR file analysis will be skipped.")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RansomwareDetector:
    """
    Advanced ransomware detection model using multiple analysis techniques:
    - File entropy analysis
    - PE header analysis
    - File signature detection
    - String analysis
    - Behavioral pattern matching
    """
    
    def __init__(self):
        self.known_ransomware_signatures = {
            # Common ransomware file signatures and strings
            'wannacry': [b'@WanaDecryptor@', b'Wanna Decrypt0r', b'.WNCRY'],
            'petya': [b'Your files are encrypted', b'1Mz7153HMuxXTuR2R1t78mGSdzaAtNbBWX'],
            'cryptolocker': [b'CryptoLocker', b'Your files are encrypted'],
            'locky': [b'_Locky_recover_instructions.txt', b'.locky'],
            'ryuk': [b'RyukReadMe.txt', b'ryuk', b'HERMES'],
            'maze': [b'maze-decrypt.txt', b'DECRYPT-FILES.html'],
            'sodinokibi': [b'recover+', b'sodinokibi'],
            'generic_ransom': [
                b'Your files have been encrypted',
                b'pay the ransom',
                b'bitcoin',
                b'decrypt',
                b'ransomware',
                b'recovery key',
                b'private key',
                b'contact us for decryption'
            ]
        }
        
        # Suspicious file extensions commonly used by ransomware
        self.suspicious_extensions = {
            '.encrypted', '.locked', '.crypto', '.crypt', '.enc', '.vault',
            '.dharma', '.cerber', '.locky', '.zepto', '.wncry', '.wcry',
            '.sage', '.spora', '.thor', '.aaa', '.abc', '.xyz', '.zzz',
            '.micro', '.mp3', '.corona', '.VirLock', '.R5A', '.R4A',
            '.herbst', '.nuclear', '.xdata', '.why', '.btc', '.wallet'
        }
        
        # Initialize the ML model (would be trained on actual dataset)
        self.ml_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.vectorizer = TfidfVectorizer(max_features=1000)
        
        # Load pre-trained model if available
        self._load_trained_model()
    
    def _load_trained_model(self):
        """Load pre-trained model if available"""
        try:
            model_path = os.path.join(os.path.dirname(__file__), 'trained_model.pkl')
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    self.ml_model = pickle.load(f)
                logger.info("Loaded pre-trained model")
        except Exception as e:
            logger.warning(f"Could not load pre-trained model: {e}")
    
    def calculate_entropy(self, data: bytes) -> float:
        """Calculate Shannon entropy of file data"""
        if not data:
            return 0
        
        # Count frequency of each byte
        byte_counts = Counter(data)
        data_len = len(data)
        
        # Calculate entropy
        entropy = 0
        for count in byte_counts.values():
            probability = count / data_len
            if probability > 0:
                entropy -= probability * math.log2(probability)
        
        return entropy
    
    def extract_pe_features(self, file_path: str) -> Dict[str, Any]:
        """Extract features from PE files"""
        features = {}
        try:
            pe = pefile.PE(file_path)
            
            # Basic PE information
            features['num_sections'] = len(pe.sections)
            features['num_imports'] = len(pe.DIRECTORY_ENTRY_IMPORT) if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT') else 0
            features['entry_point'] = pe.OPTIONAL_HEADER.AddressOfEntryPoint
            features['image_base'] = pe.OPTIONAL_HEADER.ImageBase
            
            # Section analysis
            section_entropies = []
            executable_sections = 0
            writable_sections = 0
            
            for section in pe.sections:
                section_entropy = self.calculate_entropy(section.get_data())
                section_entropies.append(section_entropy)
                
                # Check section characteristics
                if section.Characteristics & 0x20000000:  # IMAGE_SCN_MEM_EXECUTE
                    executable_sections += 1
                if section.Characteristics & 0x80000000:  # IMAGE_SCN_MEM_WRITE
                    writable_sections += 1
            
            features['avg_section_entropy'] = np.mean(section_entropies) if section_entropies else 0
            features['max_section_entropy'] = max(section_entropies) if section_entropies else 0
            features['executable_sections'] = executable_sections
            features['writable_sections'] = writable_sections
            
            # Import analysis
            suspicious_imports = [
                'CreateFile', 'WriteFile', 'CryptEncrypt', 'CryptGenKey',
                'FindFirstFile', 'FindNextFile', 'SetFileAttributes',
                'DeleteFile', 'ShellExecute', 'WinExec', 'CreateProcess'
            ]
            
            suspicious_import_count = 0
            if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
                for entry in pe.DIRECTORY_ENTRY_IMPORT:
                    for imp in entry.imports:
                        if imp.name and imp.name.decode('utf-8', errors='ignore') in suspicious_imports:
                            suspicious_import_count += 1
            
            features['suspicious_imports'] = suspicious_import_count
            
        except Exception as e:
            logger.error(f"Error extracting PE features: {e}")
            features = {
                'num_sections': 0, 'num_imports': 0, 'entry_point': 0,
                'image_base': 0, 'avg_section_entropy': 0, 'max_section_entropy': 0,
                'executable_sections': 0, 'writable_sections': 0, 'suspicious_imports': 0
            }
        
        return features
    
    def analyze_file_content(self, file_path: str) -> Dict[str, Any]:
        """Analyze file content for suspicious patterns"""
        features = {}
        
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Basic file analysis
            features['file_size'] = len(content)
            features['entropy'] = self.calculate_entropy(content)
            
            # Check for known ransomware signatures
            signature_matches = 0
            matched_families = []
            
            for family, signatures in self.known_ransomware_signatures.items():
                for signature in signatures:
                    if signature in content:
                        signature_matches += 1
                        matched_families.append(family)
            
            features['signature_matches'] = signature_matches
            features['matched_families'] = list(set(matched_families))
            
            # String analysis
            strings = self._extract_strings(content)
            features['num_strings'] = len(strings)
            
            # Check for suspicious strings - more specific keywords to reduce false positives
            suspicious_keywords = [
                'ransom', 'bitcoin', 'payment required', 'files have been encrypted',
                'decrypt your files', 'pay the ransom', 'recovery key required',
                'unlock your files', 'virus detected', 'trojan',
                'your data has been locked', 'contact us for decryption',
                'wannacry', 'cryptolocker', 'petya'
            ]
            
            suspicious_string_count = 0
            for string in strings:
                for keyword in suspicious_keywords:
                    if keyword.lower() in string.lower():
                        suspicious_string_count += 1
                        break
            
            features['suspicious_strings'] = suspicious_string_count
            
            # URL/Email analysis
            urls = self._extract_urls(strings)
            emails = self._extract_emails(strings)
            features['num_urls'] = len(urls)
            features['num_emails'] = len(emails)
            
        except Exception as e:
            logger.error(f"Error analyzing file content: {e}")
            features = {
                'file_size': 0, 'entropy': 0, 'signature_matches': 0,
                'matched_families': [], 'num_strings': 0, 'suspicious_strings': 0,
                'num_urls': 0, 'num_emails': 0
            }
        
        return features
    
    def _extract_strings(self, content: bytes, min_length: int = 4) -> List[str]:
        """Extract printable strings from binary content"""
        strings = []
        current_string = ""
        
        for byte in content:
            if 32 <= byte <= 126:  # Printable ASCII
                current_string += chr(byte)
            else:
                if len(current_string) >= min_length:
                    strings.append(current_string)
                current_string = ""
        
        if len(current_string) >= min_length:
            strings.append(current_string)
        
        return strings
    
    def _extract_urls(self, strings: List[str]) -> List[str]:
        """Extract URLs from strings"""
        import re
        url_pattern = re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')
        urls = []
        for string in strings:
            urls.extend(url_pattern.findall(string))
        return urls
    
    def _extract_emails(self, strings: List[str]) -> List[str]:
        """Extract email addresses from strings"""
        import re
        email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        emails = []
        for string in strings:
            emails.extend(email_pattern.findall(string))
        return emails
    
    def check_file_extension(self, file_path: str) -> bool:
        """Check if file has suspicious extension"""
        _, ext = os.path.splitext(file_path.lower())
        return ext in self.suspicious_extensions
    
    def analyze_file(self, file_path: str) -> Dict[str, Any]:
        """Main method to analyze a file for ransomware"""
        logger.info(f"Analyzing file: {file_path}")
        
        result = {
            'file_path': file_path,
            'file_name': os.path.basename(file_path),
            'is_ransomware': False,
            'confidence': 0.0,
            'threat_level': 'CLEAN',
            'detection_methods': [],
            'matched_families': [],
            'features': {},
            'recommendations': []
        }
        
        try:
            # Get file type
            if magic:
                file_type = magic.from_file(file_path, mime=True)
            else:
                # Fallback file type detection based on extension
                _, ext = os.path.splitext(file_path.lower())
                file_type_map = {
                    '.exe': 'application/x-executable',
                    '.pdf': 'application/pdf',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.zip': 'application/zip',
                    '.doc': 'application/msword',
                    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                }
                file_type = file_type_map.get(ext, 'application/octet-stream')
            
            result['file_type'] = file_type
            
            # Basic file analysis
            content_features = self.analyze_file_content(file_path)
            result['features'].update(content_features)
            
            # PE file specific analysis
            if file_type == 'application/x-executable' or file_path.endswith('.exe'):
                pe_features = self.extract_pe_features(file_path)
                result['features'].update(pe_features)
            
            # Check suspicious extension
            suspicious_ext = self.check_file_extension(file_path)
            if suspicious_ext:
                result['detection_methods'].append('Suspicious File Extension')
            
            # Signature-based detection
            if content_features['signature_matches'] > 0:
                result['detection_methods'].append('Known Ransomware Signatures')
                result['matched_families'] = content_features['matched_families']
            
            # Entropy-based detection
            if content_features['entropy'] > 7.5:  # High entropy threshold
                result['detection_methods'].append('High Entropy (Possible Encryption)')
            
            # Behavioral analysis
            if content_features['suspicious_strings'] > 5:
                result['detection_methods'].append('Suspicious String Patterns')
            
            # Calculate risk score
            risk_score = self._calculate_risk_score(result['features'], suspicious_ext)
            result['confidence'] = min(risk_score / 100.0, 1.0)
            
            # Determine threat level - adjusted thresholds to reduce false positives
            # Only mark as ransomware if there's strong evidence (signature match or very high score)
            if risk_score >= 85 or (risk_score >= 70 and content_features['signature_matches'] > 0):
                result['threat_level'] = 'CRITICAL'
                result['is_ransomware'] = True
            elif risk_score >= 70:
                result['threat_level'] = 'HIGH'
                result['is_ransomware'] = True
            elif risk_score >= 50:
                result['threat_level'] = 'MEDIUM'
            elif risk_score >= 25:
                result['threat_level'] = 'LOW'
            
            # Generate recommendations
            result['recommendations'] = self._generate_recommendations(result)
            
        except Exception as e:
            logger.error(f"Error analyzing file {file_path}: {e}")
            result['error'] = str(e)
        
        return result
    
    def _calculate_risk_score(self, features: Dict[str, Any], suspicious_ext: bool) -> float:
        """Calculate overall risk score based on extracted features"""
        score = 0
        
        # Signature matches (highest weight) - most reliable indicator
        score += features.get('signature_matches', 0) * 40
        
        # High entropy - adjusted thresholds to reduce false positives
        # PDFs and compressed files naturally have high entropy
        entropy = features.get('entropy', 0)
        if entropy > 7.9:  # Extremely high entropy
            score += 30
        elif entropy > 7.7:  # Very high entropy
            score += 20
        elif entropy > 7.5:  # High entropy
            score += 10
        
        # Suspicious strings - reduced weight, requires many matches
        suspicious_count = features.get('suspicious_strings', 0)
        if suspicious_count > 10:
            score += 25
        elif suspicious_count > 5:
            score += 10
        elif suspicious_count > 2:
            score += 5
        
        # Suspicious extension - strong indicator
        if suspicious_ext:
            score += 30
        
        # PE-specific features
        if 'max_section_entropy' in features:
            if features['max_section_entropy'] > 7.5:
                score += 15
            if features.get('suspicious_imports', 0) > 10:
                score += 10
        
        # URLs and emails (C&C communication) - reduced weight
        if features.get('num_urls', 0) > 5:
            score += 5
        if features.get('num_emails', 0) > 3:
            score += 3
        
        return min(score, 100)
    
    def _generate_recommendations(self, result: Dict[str, Any]) -> List[str]:
        """Generate security recommendations based on analysis"""
        recommendations = []
        
        if result['is_ransomware']:
            recommendations.extend([
                "IMMEDIATE ACTION REQUIRED: This file appears to be ransomware",
                "Do not execute this file under any circumstances",
                "Quarantine the file immediately",
                "Run a full system scan with updated antivirus software",
                "Check for any unauthorized file modifications on your system"
            ])
        elif result['threat_level'] in ['MEDIUM', 'HIGH']:
            recommendations.extend([
                "Exercise extreme caution with this file",
                "Consider running in an isolated sandbox environment",
                "Verify the file source and authenticity",
                "Scan with multiple antivirus engines"
            ])
        else:
            recommendations.append("File appears to be clean, but always exercise caution with unknown files")
        
        return recommendations

# Export the main class
__all__ = ['RansomwareDetector']
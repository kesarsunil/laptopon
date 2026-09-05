import sys
from io import BytesIO
from pathlib import Path

import streamlit as st


BACKEND_DIR = Path(__file__).resolve().parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from api.app import app as flask_app


st.set_page_config(
    page_title="File Shield Watch",
    page_icon="🛡️",
    layout="centered",
)

st.title("File Shield Watch")
st.write("Upload a file to check it for ransomware indicators.")

uploaded_file = st.file_uploader(
    "Choose a file",
    type=[
        "exe", "pdf", "jpg", "jpeg", "png", "gif", "bmp", "doc", "docx",
        "xls", "xlsx", "ppt", "pptx", "zip", "rar", "7z", "tar", "gz",
        "txt", "rtf", "csv", "xml", "json",
    ],
)

if uploaded_file is not None and st.button("Scan file", type="primary"):
    with st.spinner("Analyzing file..."):
        response = flask_app.test_client().post(
            "/api/upload",
            data={
                "file": (
                    BytesIO(uploaded_file.getvalue()),
                    uploaded_file.name,
                )
            },
            content_type="multipart/form-data",
        )

    result = response.get_json(silent=True) or {}
    if response.status_code != 200 or not result.get("success"):
        st.error(result.get("error", "The file could not be scanned."))
    else:
        scan_result = result["result"]
        if scan_result["is_ransomware"]:
            st.error(f"Threat detected: {scan_result['threat_level']}")
        else:
            st.success(f"No ransomware detected: {scan_result['threat_level']}")

        st.json(scan_result)
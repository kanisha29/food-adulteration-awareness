import os
import uuid
import config


def _looks_like_image(head):
    return (head.startswith(b"\xff\xd8\xff") or head.startswith(b"\x89PNG\r\n\x1a\n")
            or (head[:4] == b"RIFF" and head[8:12] == b"WEBP"))


def validate_image(file):
    """Return (ext, bytes) or raise ValueError with a user-friendly message."""
    name = file.filename or ""
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ext not in config.ALLOWED_EXTENSIONS:
        raise ValueError("Only PNG, JPG or WEBP images are allowed.")
    data = file.read()
    if not data:
        raise ValueError("The uploaded file is empty.")
    if len(data) > config.MAX_CONTENT_LENGTH:
        raise ValueError("Image must be smaller than 5 MB.")
    if not _looks_like_image(data[:16]):
        raise ValueError("The file does not look like a valid image.")
    return ext, data


def save_image(file):
    ext, data = validate_image(file)
    filename = f"{uuid.uuid4().hex}.{ext}"
    with open(os.path.join(config.UPLOAD_DIR, filename), "wb") as fh:
        fh.write(data)
    return filename

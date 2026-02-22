<= 0:
                    break


@router.get("/{video_id}", response_model=VideoOut)
def get_video_metadata(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve video metadata. Accessible to any authenticated user.
    """
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found.")
    return video


@router.get("/{video_id}/stream")
def stream_video(
    video_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Stream video content with support for HTTP Range requests.
    """
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found.")

    file_path = get_video_path(video)

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on server.")

    file_size = os.path.getsize(file_path)
    content_type, _ = mimetypes.guess_type(file_path)
    content_type = content_type or "application/octet-stream"

    range_header = request.headers.get("range")
    if range_header:
        start, end = range_parser(range_header, file_size)
        content_length = end - start + 1
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(content_length),
            "Content-Type": content_type,
        }
        return StreamingResponse(
            file_iterator(file_path, start, end),
            status_code=status.HTTP_206_PARTIAL_CONTENT,
            headers=headers,
        )
    else:
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
            "Content-Type": content_type,
        }
        return StreamingResponse(
            file_iterator(file_path),
            status_code=status.HTTP_200_OK,
            headers=headers,
        )


@router.post(
    "/upload",
    response_model=VideoOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user)],  # Auth handled inside
)
async def upload_video(
    title: str = Depends(),
    description: Optional[str] = Depends(),
    category_id: int = Depends(),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a new video. Only users with a Creator role can upload.
    """
    if not current_user.is_creator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can upload videos.",
        )

    # Validate MIME type (basic check)
    mime_type, _ = mimetypes.guess_type(file.filename)
    if not mime_type or not mime_type.startswith("video/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a video.",
        )

    # Ensure storage directory exists
    creator_folder = os.path.join(MEDIA_ROOT, f"creator_{current_user.id}")
    os.makedirs(creator_folder, exist_ok=True)

    # Generate a unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_name = f"{title.replace(' ', '_')}_{int(os.time.time())}{file_ext}"
    file_path = os.path.join(creator_folder, unique_name)

    # Write file to disk in chunks
    with open(file_path, "wb") as buffer:
        while True:
            chunk = await file.read(CHUNK_SIZE)
            if not chunk:
                break
            buffer.write(chunk)

    # Persist video record
    video = Video(
        title=title,
        description=description,
        file_path=os.path.relpath(file_path, MEDIA_ROOT),
        creator_id=current_user.id,
        category_id=category_id,
        duration=0,  # Placeholder; could be extracted with ffprobe later
        thumbnail_path=None,
    )
    db.add(video)
    db.commit()
    db.refresh(video)

    return video
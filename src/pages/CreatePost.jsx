// src/pages/CreatePost.js
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FaImage, FaVideo, FaMapMarkerAlt, FaHashtag } from "react-icons/fa";
import { postService } from "../services/api";
import Loader from "../components/common/Loader";

const CreatePost = () => {
    const [formData, setFormData] = useState({
        caption: "",
        location: "",
        hashtags: "",
    });
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
        const validVideoTypes = [
            "video/mp4",
            "video/quicktime",
            "video/x-msvideo",
        ];

        if (validImageTypes.includes(file.type)) {
            setMediaType("image");
        } else if (validVideoTypes.includes(file.type)) {
            setMediaType("video");
        } else {
            toast.error("Please select a valid image or video file");
            return;
        }

        setMediaFile(file);

        // Create media preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setMediaPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!mediaFile && !mediaPreview) {
            toast.error("Please select an image or video");
            return;
        }

        try {
            setLoading(true);

            const formDataToSend = new FormData();

            if (mediaFile) {
                formDataToSend.append("media", mediaFile);
            } else if (mediaPreview) {
                // If we have a base64 image preview (from drag and drop or paste)
                formDataToSend.append("mediaUrl", mediaPreview);
            }

            formDataToSend.append("caption", formData.caption);
            formDataToSend.append("location", formData.location);

            // Extract hashtags from both caption and hashtags field
            const captionHashtags =
                formData.caption.match(/#[a-zA-Z0-9_]+/g) || [];
            const manualHashtags = formData.hashtags
                .split(" ")
                .filter((tag) => tag.trim() !== "")
                .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

            const uniqueHashtags = [
                ...new Set([...captionHashtags, ...manualHashtags]),
            ];
            formDataToSend.append("hashtags", uniqueHashtags.join(" "));

            await postService.createPost(formDataToSend);

            toast.success("Post created successfully!");
            navigate("/");
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating post");
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];

            // Validate file type
            const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
            const validVideoTypes = [
                "video/mp4",
                "video/quicktime",
                "video/x-msvideo",
            ];

            if (validImageTypes.includes(file.type)) {
                setMediaType("image");
            } else if (validVideoTypes.includes(file.type)) {
                setMediaType("video");
            } else {
                toast.error("Please select a valid image or video file");
                return;
            }

            setMediaFile(file);

            // Create media preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <CreatePostContainer>
            <PageHeader>Create New Post</PageHeader>

            <FormContainer onSubmit={handleSubmit}>
                <MediaSection>
                    {mediaPreview ? (
                        <MediaPreviewContainer>
                            {mediaType === "image" ? (
                                <MediaPreviewImage
                                    src={mediaPreview}
                                    alt="Preview"
                                />
                            ) : (
                                <MediaPreviewVideo
                                    src={mediaPreview}
                                    controls
                                />
                            )}
                            <RemoveButton
                                onClick={() => {
                                    setMediaPreview(null);
                                    setMediaFile(null);
                                    setMediaType(null);
                                }}
                            >
                                Remove
                            </RemoveButton>
                        </MediaPreviewContainer>
                    ) : (
                        <UploadArea
                            onClick={triggerFileInput}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <UploadIcon>
                                <FaImage />
                                <FaVideo />
                            </UploadIcon>
                            <UploadText>
                                Drag photos and videos here, or click to select
                            </UploadText>
                            <FileInput
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
                                hidden
                            />
                        </UploadArea>
                    )}
                </MediaSection>

                <FormSection>
                    <FormGroup>
                        <FormLabel>Caption</FormLabel>
                        <CaptionInput
                            name="caption"
                            value={formData.caption}
                            onChange={handleChange}
                            placeholder="Write a caption..."
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>
                            <FaMapMarkerAlt /> Location
                        </FormLabel>
                        <FormInput
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Add location"
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>
                            <FaHashtag /> Hashtags
                        </FormLabel>
                        <FormInput
                            name="hashtags"
                            value={formData.hashtags}
                            onChange={handleChange}
                            placeholder="Add hashtags (space separated)"
                        />
                    </FormGroup>

                    <SubmitButton
                        type="submit"
                        disabled={!mediaPreview || loading}
                    >
                        {loading ? "Posting..." : "Share"}
                    </SubmitButton>
                </FormSection>
            </FormContainer>
        </CreatePostContainer>
    );
};

// Styled Components
const CreatePostContainer = styled.div`
    max-width: 935px;
    margin: 0 auto;
    padding: 30px 0;
`;

const PageHeader = styled.h1`
    font-size: 24px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 30px;
    text-align: center;
`;

const FormContainer = styled.form`
    display: flex;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const MediaSection = styled.div`
    flex: 1;
    border-right: 1px solid #dbdbdb;

    @media (max-width: 768px) {
        border-right: none;
        border-bottom: 1px solid #dbdbdb;
    }
`;

const UploadArea = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    height: 100%;
    min-height: 450px;
    cursor: pointer;
    background: #fafafa;

    &:hover {
        background: #f0f0f0;
    }
`;

const UploadIcon = styled.div`
    display: flex;
    gap: 20px;
    font-size: 48px;
    color: #8e8e8e;
    margin-bottom: 20px;
`;

const UploadText = styled.p`
    color: #8e8e8e;
    font-size: 18px;
    text-align: center;
    max-width: 280px;
`;

const FileInput = styled.input``;

const MediaPreviewContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 450px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
`;

const MediaPreviewImage = styled.img`
    max-width: 100%;
    max-height: 450px;
    object-fit: contain;
`;

const MediaPreviewVideo = styled.video`
    max-width: 100%;
    max-height: 450px;
    object-fit: contain;
`;

const RemoveButton = styled.button`
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        background: rgba(0, 0, 0, 0.8);
    }
`;

const FormSection = styled.div`
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;
`;

const FormLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #262626;

    svg {
        color: #8e8e8e;
        font-size: 16px;
    }
`;

const FormInput = styled.input`
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        border-color: #8e8e8e;
        outline: none;
    }
`;

const CaptionInput = styled.textarea`
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;
    min-height: 150px;

    &:focus {
        border-color: #8e8e8e;
        outline: none;
    }
`;

const SubmitButton = styled.button`
    margin-top: auto;
    background: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &:hover:not(:disabled) {
        background: #0086e0;
    }
`;

export default CreatePost;

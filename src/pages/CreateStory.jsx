// src/pages/CreateStory.js
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FaImage, FaQuoteLeft, FaLightbulb, FaClock } from "react-icons/fa";
import { storyService } from "../services/api";
import Loader from "../components/common/Loader";

const CreateStory = () => {
    const [formData, setFormData] = useState({
        content: "",
        storyType: "thought", // Default type: 'thought' or 'poetry' or 'ephemeral'
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

    const handleTypeChange = (type) => {
        setFormData({ ...formData, storyType: type });
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

        if (!formData.content.trim()) {
            toast.error("Please add some content to your story");
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

            formDataToSend.append("content", formData.content);
            formDataToSend.append("storyType", formData.storyType);

            // Extract hashtags from both content and hashtags field
            const contentHashtags =
                formData.content.match(/#[a-zA-Z0-9_]+/g) || [];
            const manualHashtags = formData.hashtags
                .split(" ")
                .filter((tag) => tag.trim() !== "")
                .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

            const uniqueHashtags = [
                ...new Set([...contentHashtags, ...manualHashtags]),
            ];
            formDataToSend.append("hashtags", uniqueHashtags.join(" "));

            await storyService.createStory(formDataToSend);

            toast.success("Story created successfully!");

            if (formData.storyType === "ephemeral") {
                navigate("/");
            } else {
                navigate("/creative-board");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Error creating story"
            );
        } finally {
            setLoading(false);
        }
    };

    const getPreviewBackground = () => {
        if (mediaPreview) return "black";
        if (formData.storyType === "poetry")
            return "linear-gradient(135deg, #4158D0, #C850C0)";
        if (formData.storyType === "thought")
            return "linear-gradient(135deg, #0F2027, #203A43, #2C5364)";
        return "linear-gradient(135deg, #FF416C, #FF4B2B)"; // ephemeral
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <CreateStoryContainer>
            <PageHeader>Create Story</PageHeader>

            <StoryTypeSelector>
                <TypeOption
                    active={formData.storyType === "thought"}
                    onClick={() => handleTypeChange("thought")}
                >
                    <FaLightbulb />
                    <span>Thought</span>
                </TypeOption>
                <TypeOption
                    active={formData.storyType === "poetry"}
                    onClick={() => handleTypeChange("poetry")}
                >
                    <FaQuoteLeft />
                    <span>Poetry</span>
                </TypeOption>
                <TypeOption
                    active={formData.storyType === "ephemeral"}
                    onClick={() => handleTypeChange("ephemeral")}
                >
                    <FaClock />
                    <span>24h Story</span>
                </TypeOption>
            </StoryTypeSelector>

            <FormContainer onSubmit={handleSubmit}>
                <PreviewSection background={getPreviewBackground()}>
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
                        <ContentPreview>
                            {formData.content ||
                                "Your story will appear here..."}
                            <MediaUploadButton onClick={triggerFileInput}>
                                <FaImage />
                            </MediaUploadButton>
                            <FileInput
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
                                hidden
                            />
                        </ContentPreview>
                    )}
                </PreviewSection>

                <FormSection>
                    <FormGroup>
                        <FormLabel>Content</FormLabel>
                        <ContentInput
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder={
                                formData.storyType === "poetry"
                                    ? "Write your poem..."
                                    : formData.storyType === "thought"
                                    ? "Share your thoughts..."
                                    : "Write your story..."
                            }
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Hashtags</FormLabel>
                        <FormInput
                            name="hashtags"
                            value={formData.hashtags}
                            onChange={handleChange}
                            placeholder="Add hashtags (space separated)"
                        />
                    </FormGroup>

                    <StoryInfo>
                        {formData.storyType === "ephemeral" ? (
                            <InfoText>
                                This story will disappear after 24 hours
                            </InfoText>
                        ) : (
                            <InfoText>
                                This story will be permanently visible on the
                                Creative Board
                            </InfoText>
                        )}
                    </StoryInfo>

                    <SubmitButton
                        type="submit"
                        disabled={!formData.content.trim() || loading}
                    >
                        {loading ? "Creating..." : "Share"}
                    </SubmitButton>
                </FormSection>
            </FormContainer>
        </CreateStoryContainer>
    );
};

// Styled Components
const CreateStoryContainer = styled.div`
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

const StoryTypeSelector = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
`;

const TypeOption = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 24px;
    margin: 0 8px;
    background: ${(props) => (props.active ? "#0095f6" : "white")};
    color: ${(props) => (props.active ? "white" : "#262626")};
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    svg {
        font-size: 24px;
        margin-bottom: 8px;
    }

    span {
        font-weight: 500;
    }
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

const PreviewSection = styled.div`
    flex: 1;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(props) => props.background || "black"};
    position: relative;

    @media (max-width: 768px) {
        min-height: 300px;
    }
`;

const ContentPreview = styled.div`
    padding: 24px;
    color: white;
    font-size: 20px;
    text-align: center;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: pre-wrap;
    overflow: auto;
    position: relative;
`;

const MediaUploadButton = styled.button`
    position: absolute;
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    cursor: pointer;

    &:hover {
        background: rgba(255, 255, 255, 0.3);
    }
`;

const FileInput = styled.input``;

const MediaPreviewContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const MediaPreviewImage = styled.img`
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
`;

const MediaPreviewVideo = styled.video`
    max-width: 100%;
    max-height: 400px;
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
    font-weight: 500;
    margin-bottom: 8px;
    display: block;
    color: #262626;
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

const ContentInput = styled.textarea`
    width: 100%;
    padding: 12px;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    font-size: 16px;
    resize: vertical;
    min-height: 200px;

    &:focus {
        border-color: #8e8e8e;
        outline: none;
    }
`;

const StoryInfo = styled.div`
    margin-top: auto;
    margin-bottom: 16px;
`;

const InfoText = styled.p`
    color: #8e8e8e;
    font-size: 14px;
    text-align: center;
`;

const SubmitButton = styled.button`
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

export default CreateStory;

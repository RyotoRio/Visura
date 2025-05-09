// src/pages/EditProfile.js
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FaCamera, FaGlobe, FaLock, FaUnlock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

const EditProfile = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        username: user?.username || "",
        fullName: user?.fullName || "",
        email: user?.email || "",
        bio: user?.bio || "",
        website: user?.website || "",
        profilePicture: user?.profilePicture || "",
        isPrivate: user?.isPrivate || false,
        password: "",
        confirmPassword: "",
    });

    const [avatarPreview, setAvatarPreview] = useState(
        user?.profilePicture || ""
    );
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validImageTypes.includes(file.type)) {
            toast.error("Please select a valid image file (JPEG, PNG, GIF)");
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
            setFormData({
                ...formData,
                profilePicture: reader.result,
            });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match if changing password
        if (
            formData.password &&
            formData.password !== formData.confirmPassword
        ) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            // Clean up form data to send (remove confirmPassword)
            const { confirmPassword, ...dataToSend } = formData;

            // Only include password if changing it
            if (!dataToSend.password) {
                delete dataToSend.password;
            }

            await updateProfile(dataToSend);

            toast.success("Profile updated successfully");
            navigate(`/${formData.username}`);
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to update profile"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <EditProfileContainer>
            <PageHeader>Edit Profile</PageHeader>

            <FormContainer onSubmit={handleSubmit}>
                <AvatarSection>
                    <AvatarContainer onClick={handleAvatarClick}>
                        <Avatar src={avatarPreview} alt={user?.username} />
                        <AvatarOverlay>
                            <FaCamera />
                        </AvatarOverlay>
                    </AvatarContainer>
                    <FileInput
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/gif"
                        hidden
                    />
                    <Username>{user?.username}</Username>
                    <ChangePhotoText>Change Profile Photo</ChangePhotoText>
                </AvatarSection>

                <FormSection>
                    <FormGroup>
                        <FormLabel>Name</FormLabel>
                        <FormInput
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Full Name"
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Username</FormLabel>
                        <FormInput
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Username"
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Email</FormLabel>
                        <FormInput
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Bio</FormLabel>
                        <TextArea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Bio"
                            rows="4"
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>
                            <FaGlobe /> Website
                        </FormLabel>
                        <FormInput
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="Website"
                        />
                    </FormGroup>

                    <FormGroup>
                        <PrivacyLabel>
                            <PrivacyIcon>
                                {formData.isPrivate ? <FaLock /> : <FaUnlock />}
                            </PrivacyIcon>
                            <div>
                                <PrivacyTitle>Private Account</PrivacyTitle>
                                <PrivacyDescription>
                                    When your account is private, only people
                                    you approve can see your photos and videos.
                                </PrivacyDescription>
                            </div>
                            <PrivacyToggle>
                                <PrivacyCheckbox
                                    type="checkbox"
                                    name="isPrivate"
                                    checked={formData.isPrivate}
                                    onChange={handleChange}
                                />
                                <PrivacySlider />
                            </PrivacyToggle>
                        </PrivacyLabel>
                    </FormGroup>

                    <SectionDivider />

                    <SectionTitle>Change Password</SectionTitle>

                    <FormGroup>
                        <FormLabel>New Password</FormLabel>
                        <FormInput
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="New Password"
                            autoComplete="new-password"
                        />
                        <FieldHint>
                            Leave blank to keep current password
                        </FieldHint>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormInput
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm New Password"
                            autoComplete="new-password"
                        />
                    </FormGroup>

                    <ButtonGroup>
                        <CancelButton
                            type="button"
                            onClick={() => navigate(`/${user?.username}`)}
                        >
                            Cancel
                        </CancelButton>
                        <SubmitButton type="submit">Save Changes</SubmitButton>
                    </ButtonGroup>
                </FormSection>
            </FormContainer>
        </EditProfileContainer>
    );
};

// Styled Components
const EditProfileContainer = styled.div`
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

const AvatarSection = styled.div`
    flex: 0 0 200px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-right: 1px solid #dbdbdb;

    @media (max-width: 768px) {
        border-right: none;
        border-bottom: 1px solid #dbdbdb;
    }
`;

const AvatarContainer = styled.div`
    position: relative;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    cursor: pointer;
    margin-bottom: 16px;

    &:hover > div {
        opacity: 1;
    }
`;

const Avatar = styled.img`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
`;

const AvatarOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    opacity: 0;
    transition: opacity 0.2s;
`;

const FileInput = styled.input``;

const Username = styled.h3`
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
`;

const ChangePhotoText = styled.p`
    color: #0095f6;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;

const FormSection = styled.div`
    flex: 1;
    padding: 30px;
`;

const FormGroup = styled.div`
    margin-bottom: 24px;
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
    }
`;

const FormInput = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        border-color: #8e8e8e;
        outline: none;
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 10px;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;

    &:focus {
        border-color: #8e8e8e;
        outline: none;
    }
`;

const FieldHint = styled.p`
    margin-top: 4px;
    font-size: 12px;
    color: #8e8e8e;
`;

const PrivacyLabel = styled.label`
    display: flex;
    align-items: center;
    cursor: pointer;
`;

const PrivacyIcon = styled.div`
    margin-right: 16px;
    color: #8e8e8e;
    font-size: 24px;
`;

const PrivacyTitle = styled.h4`
    font-weight: 600;
    margin-bottom: 4px;
`;

const PrivacyDescription = styled.p`
    font-size: 12px;
    color: #8e8e8e;
    max-width: 400px;
`;

const PrivacyToggle = styled.div`
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
    margin-left: auto;
`;

const PrivacyCheckbox = styled.input`
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + span {
        background-color: #0095f6;
    }

    &:checked + span:before {
        transform: translateX(26px);
    }
`;

const PrivacySlider = styled.span`
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 24px;

    &:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
    }
`;

const SectionDivider = styled.hr`
    border: none;
    border-top: 1px solid #dbdbdb;
    margin: 30px 0;
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 16px;
    margin-top: 30px;
`;

const SubmitButton = styled.button`
    flex: 1;
    background: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        background: #0086e0;
    }
`;

const CancelButton = styled.button`
    flex: 1;
    background: transparent;
    color: #262626;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    padding: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        background: #fafafa;
    }
`;

export default EditProfile;

// src/pages/Register.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        username: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await register(formData);
            navigate("/");
            toast.success("Registration successful!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RegisterContainer>
            <RegisterForm onSubmit={handleSubmit}>
                <LogoHeading>Visage</LogoHeading>
                <Tagline>
                    Sign up to see photos and videos from your friends.
                </Tagline>

                <FormGroup>
                    <FormLabel>Email</FormLabel>
                    <FormInput
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel>Full Name</FormLabel>
                    <FormInput
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel>Username</FormLabel>
                    <FormInput
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel>Password</FormLabel>
                    <FormInput
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                    />
                </FormGroup>

                <SubmitButton type="submit" disabled={isLoading}>
                    {isLoading ? "Signing up..." : "Sign Up"}
                </SubmitButton>

                <TermsText>
                    By signing up, you agree to our Terms, Privacy Policy and
                    Cookies Policy.
                </TermsText>

                <Separator>
                    <Line />
                    <Or>OR</Or>
                    <Line />
                </Separator>

                <LoginLink>
                    Have an account? <Link to="/login">Log In</Link>
                </LoginLink>
            </RegisterForm>
        </RegisterContainer>
    );
};

// Styled Components
const RegisterContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #fafafa;
`;

const RegisterForm = styled.form`
    background-color: white;
    border: 1px solid #dbdbdb;
    padding: 40px;
    border-radius: 4px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const LogoHeading = styled.h1`
    font-family: "Grand Hotel", cursive;
    font-size: 42px;
    text-align: center;
    margin-bottom: 10px;
    color: #262626;
`;

const Tagline = styled.p`
    text-align: center;
    color: #8e8e8e;
    font-size: 17px;
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 20px;
`;

const FormGroup = styled.div`
    margin-bottom: 15px;
`;

const FormLabel = styled.label`
    display: block;
    margin-bottom: 5px;
    font-size: 14px;
    font-weight: 500;
`;

const FormInput = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    font-size: 16px;

    &:focus {
        outline: none;
        border-color: #8e8e8e;
    }
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 10px;
    background-color: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    &:hover:not(:disabled) {
        background-color: #0086e0;
    }
`;

const TermsText = styled.p`
    margin-top: 15px;
    text-align: center;
    color: #8e8e8e;
    font-size: 12px;
    line-height: 16px;
`;

const Separator = styled.div`
    display: flex;
    align-items: center;
    margin: 20px 0;
`;

const Line = styled.div`
    flex: 1;
    height: 1px;
    background-color: #dbdbdb;
`;

const Or = styled.div`
    padding: 0 10px;
    color: #8e8e8e;
    font-size: 14px;
    font-weight: 500;
`;

const LoginLink = styled.p`
    text-align: center;
    font-size: 14px;
    color: #262626;

    a {
        color: #0095f6;
        text-decoration: none;
        font-weight: 600;

        &:hover {
            text-decoration: underline;
        }
    }
`;

export default Register;

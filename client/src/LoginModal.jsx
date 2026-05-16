import { useState, useEffect } from 'react';
import { Modal, TextInput, Button, Text, Stack } from '@mantine/core';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from './firebase';
import { authService } from './services/api';
import { useAuth } from './AuthContext';
import { useLang } from './i18n';

export default function LoginModal({ opened, onClose }) {
  const { t } = useLang();
  const { currentUser } = useAuth();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize reCAPTCHA when modal opens
    if (opened && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      });
    }
  }, [opened]);

  // Close automatically if logged in
  useEffect(() => {
    if (currentUser) {
      onClose();
    }
  }, [currentUser, onClose]);

  const handleSendCode = async () => {
    setError('');
    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      // Firebase requires phone numbers in E.164 format (e.g. +1234567890)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err) {
      console.error('Error sending SMS', err);
      setError(err.message || 'Failed to send SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;
      
      // Get Firebase Token
      const idToken = await user.getIdToken();
      
      // Send token to our backend to sync votes
      await authService.login(idToken);
      
      onClose();
    } catch (err) {
      console.error('Error verifying code', err);
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={700}>Login</Text>} centered>
      <Stack>
        <Text size="sm" c="dimmed">
          Sign in to save your votes and see all results.
        </Text>
        
        {error && <Text c="red" size="sm">{error}</Text>}

        {!confirmationResult ? (
          <>
            <TextInput
              label="Phone Number"
              placeholder="+1 234 567 8900"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.currentTarget.value)}
              description="Include country code (e.g. +1)"
            />
            <Button loading={loading} onClick={handleSendCode}>
              Send SMS Code
            </Button>
          </>
        ) : (
          <>
            <TextInput
              label="Verification Code"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.currentTarget.value)}
            />
            <Button loading={loading} onClick={handleVerifyCode}>
              Verify & Login
            </Button>
          </>
        )}
        
        <div id="recaptcha-container"></div>
      </Stack>
    </Modal>
  );
}

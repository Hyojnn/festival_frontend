// frontend/src/components/PersonalInfoVerification.jsx
import React, { useState } from 'react';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import { FaLock } from 'react-icons/fa';
import '../mypage.css'; // 마이페이지 전용 CSS (새로 만들 예정)

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PersonalInfoVerification({ t, onVerificationSuccess }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError(t('login_required', '로그인이 필요합니다.'));
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/mypage/verify-password`, { password }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                onVerificationSuccess(); // 인증 성공 시 부모 컴포넌트에 알림
            } else {
                setError(t('incorrect_password', '비밀번호가 올바르지 않습니다.'));
            }
        } catch (err) {
            console.error("Password verification failed:", err.response ? err.response.data : err.message);
            setError(t('verification_error', `비밀번호 확인 중 오류가 발생했습니다: ${err.response?.data?.error || err.message}`));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="personal-info-verification">
            <p>{t('password_re_enter_prompt', '개인 정보를 확인하거나 수정하려면 비밀번호를 다시 입력해주세요.')}</p>
            <form onSubmit={handleVerify} className="verification-form">
                <div className="input-group">
                    <label htmlFor="current-password"><FaLock /> {t('password_label', '비밀번호')}:</label>
                    <input
                        type="password"
                        id="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('password_placeholder', '비밀번호를 입력하세요')}
                        required
                        disabled={loading}
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" disabled={loading} className="verify-button">
                    {loading ? t('verifying', '확인 중...') : t('verify_button', '확인')}
                </button>
            </form>
        </div>
    );
}

export default withTranslation()(PersonalInfoVerification);
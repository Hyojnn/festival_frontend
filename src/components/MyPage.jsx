// frontend/src/components/MyPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import { FaUserCircle, FaEnvelope, FaTag, FaPhone, FaMapMarkerAlt, FaEdit, FaLock, FaClipboardList, FaKey } from 'react-icons/fa';
import PersonalInfoVerification from './PersonalInfoVerification';
import '../mypage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Register.jsx에서 사용된 관심사 옵션을 가져와서 재사용합니다.
const interestOptions = ["음악", "음식", "전통문화", "연극", "야시장", "전통", "야간", "콘서트", "한복"];
const regionOptions = [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시",
    "울산광역시", "세종특별자치시", "경기도", "강원특별자치도", "충청북도", "충청남도",
    "전북특별자치도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
];

function MyPage({ t }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [isPersonalInfoVerified, setIsPersonalInfoVerified] = useState(false);
    const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false); // 전화번호/지역 수정 모드
    const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false); // ✨ 관심사 수정 모드 추가

    const [newPhoneNumber, setNewPhoneNumber] = useState('');
    const [newRegion, setNewRegion] = useState('');
    const [newInterests, setNewInterests] = useState([]);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert(t('login_required', '로그인이 필요합니다.'));
            navigate('/login');
            return;
        }
        fetchUserData(token);
        fetchUserPosts(token);
    }, [navigate, t]);

    const fetchUserData = async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/mypage/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(response.data);
            setNewPhoneNumber(response.data.phoneNumber || '');
            setNewRegion(response.data.region || '');
            setNewInterests(response.data.interests || []);
        } catch (err) {
            console.error("Failed to fetch user data:", err.response ? err.response.data : err.message);
            setError(t('failed_to_load_profile', '프로필 정보를 불러오는 데 실패했습니다.'));
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPosts = async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/mypage/posts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserPosts(response.data.posts);
        } catch (err) {
            console.error("Failed to fetch user posts:", err.response ? err.response.data : err.message);
        }
    };

    const handlePersonalInfoVerificationSuccess = () => {
        setIsPersonalInfoVerified(true);
    };

    // ✨ 기본 정보 (관심사) 수정 모드 토글
    const handleEditBasicInfo = () => {
        setIsEditingBasicInfo(true);
    };

    const handleCancelBasicEdit = () => {
        setIsEditingBasicInfo(false);
        setNewInterests(userData.interests || []); // 취소 시 초기값으로 되돌림
    };

    // ✨ 기본 정보 (관심사) 저장
    const handleSaveBasicInfo = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert(t('login_required_to_save', '로그인이 필요합니다.'));
            navigate('/login');
            return;
        }

        try {
            // 관심사는 phoneNumber, region과 동일한 API를 사용하므로 해당 API로 전송
            await axios.put(`${API_BASE_URL}/api/mypage/profile/edit`, {
                // 기존 값 유지 (서버에서 이 필드를 필수 검사할 경우 필요)
                phoneNumber: userData.phoneNumber,
                region: userData.region,
                interests: newInterests,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(t('interests_update_success', '관심사 정보가 성공적으로 업데이트되었습니다.'));
            setIsEditingBasicInfo(false);
            fetchUserData(token); // 업데이트된 정보 다시 불러오기
        } catch (err) {
            console.error("Failed to update user interests:", err.response ? err.response.data : err.message);
            alert(t('interests_update_fail', `관심사 업데이트에 실패했습니다: ${err.response?.data?.error || err.message}`));
        }
    };

    // 전화번호/지역 수정 모드 토글 (기존)
    const handleEditPersonalInfo = () => {
        setIsEditingPersonalInfo(true);
        setPasswordError('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    };

    const handleCancelPersonalInfoEdit = () => { // ✨ 함수명 변경: 개인 정보 수정 취소
        setIsEditingPersonalInfo(false);
        setNewPhoneNumber(userData.phoneNumber || '');
        setNewRegion(userData.region || '');
        setPasswordError('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    };

    // ✨ 관심사 변경 핸들러 (기존과 동일)
    const handleInterestChange = (e) => {
        const { value, checked } = e.target;
        setNewInterests(prevInterests => {
            if (checked) {
                return [...prevInterests, value];
            } else {
                return prevInterests.filter(item => item !== value);
            }
        });
    };

    // 전화번호/지역 저장 (기존)
    const handleSavePersonalInfo = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert(t('login_required_to_save', '로그인이 필요합니다.'));
            navigate('/login');
            return;
        }

        if (!newPhoneNumber || !newRegion) {
            alert(t('phone_region_required', '전화번호와 거주 지역은 필수 항목입니다.'));
            return;
        }
        const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
        if (!phoneRegex.test(newPhoneNumber)) {
            alert(t('validate_phone_format', '올바른 전화번호 형식(예: 010-1234-5678)이 아닙니다.'));
            return;
        }

        try {
            // 기존 관심사도 함께 전송 (이 API는 phoneNumber, region, interests를 모두 처리)
            await axios.put(`${API_BASE_URL}/api/mypage/profile/edit`, {
                phoneNumber: newPhoneNumber,
                region: newRegion,
                interests: userData.interests, // ✨ 관심사는 변경하지 않으므로 기존 userData의 관심사를 사용
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(t('profile_update_success', '프로필 정보가 성공적으로 업데이트되었습니다.'));
            setIsEditingPersonalInfo(false);
            fetchUserData(token);
        } catch (err) {
            console.error("Failed to update user profile:", err.response ? err.response.data : err.message);
            alert(t('profile_update_fail', `프로필 업데이트에 실패했습니다: ${err.response?.data?.error || err.message}`));
        }
    };

    // 비밀번호 변경 처리 함수 (기존)
    const handleChangePassword = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert(t('login_required_to_change_password', '비밀번호를 변경하려면 로그인이 필요합니다.'));
            navigate('/login');
            return;
        }

        if (!currentPassword) {
            setPasswordError(t('enter_current_password', '현재 비밀번호를 입력해주세요.'));
            return;
        }
        if (!newPassword || !confirmNewPassword) {
            setPasswordError(t('enter_new_password', '새로운 비밀번호와 확인 비밀번호를 모두 입력해주세요.'));
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordError(t('password_mismatch', '새로운 비밀번호가 일치하지 않습니다.'));
            return;
        }
        if (newPassword === currentPassword) {
            setPasswordError(t('new_password_same_as_old', '새로운 비밀번호는 현재 비밀번호와 달라야 합니다.'));
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError(t('password_too_short', '새로운 비밀번호는 최소 6자 이상이어야 합니다.'));
            return;
        }

        setPasswordError('');

        try {
            await axios.put(`${API_BASE_URL}/api/mypage/change-password`, {
                currentPassword,
                newPassword,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(t('password_change_success', '비밀번호가 성공적으로 변경되었습니다.'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setIsEditingPersonalInfo(false); // 비밀번호 변경 후 정보 수정 모드 종료
        } catch (err) {
            console.error("Failed to change password:", err.response ? err.response.data : err.message);
            const errorMessage = err.response?.data?.error || err.message;
            if (err.response?.status === 401 && errorMessage.includes('올바르지 않습니다')) {
                setPasswordError(t('incorrect_current_password', '현재 비밀번호가 올바르지 않습니다.'));
            } else {
                setPasswordError(t('password_change_fail', `비밀번호 변경에 실패했습니다: ${errorMessage}`));
            }
        }
    };


    if (loading) return <div className="mypage-container"><p>{t('loading_profile', '프로필을 불러오는 중...')}</p></div>;
    if (error) return <div className="mypage-container"><p className="error-message">{error}</p></div>;
    if (!userData) return <div className="mypage-container"><p>{t('no_profile_data', '프로필 데이터를 찾을 수 없습니다.')}</p></div>;

    return (
        <div className="mypage-container">
            <h1 className="mypage-title">{t('mypage_title', '마이페이지')}</h1>

            <section className="mypage-section basic-info-section">
                <h2 className="section-title"><FaUserCircle /> {t('basic_info_title', '기본 정보')}</h2>
                <div className="info-item">
                    <span className="info-label"><FaEnvelope /> {t('username_label', '아이디')}:</span>
                    <span className="info-value">{userData.username}</span>
                </div>
                {/* ✨ 관심사 정보 표시 및 수정 폼 */}
                {!isEditingBasicInfo ? (
                    <div className="info-item">
                        <span className="info-label"><FaTag /> {t('interests_label', '관심사')}:</span>
                        <span className="info-value">
                            {Array.isArray(userData.interests) && userData.interests.length > 0
                                ? userData.interests.join(', ')
                                : t('no_interests', '관심사 없음')}
                        </span>
                        <button onClick={handleEditBasicInfo} className="edit-button-inline">
                            <FaEdit /> {t('edit_button', '수정')}
                        </button>
                    </div>
                ) : (
                    <div className="edit-form basic-info-edit-form">
                        <div className="input-group">
                            <label><FaTag /> {t('interests_label', '관심사')}:</label>
                            <div className="interest-checkboxes" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {interestOptions.map((interest, index) => (
                                    <label key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            value={interest}
                                            checked={newInterests.includes(interest)}
                                            onChange={handleInterestChange}
                                            style={{ marginRight: '5px' }}
                                        />
                                        {interest}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-actions">
                            <button onClick={handleSaveBasicInfo} className="save-button">{t('save_button', '저장')}</button>
                            <button onClick={handleCancelBasicEdit} className="cancel-button">{t('cancel_button', '취소')}</button>
                        </div>
                    </div>
                )}
            </section>

            <section className="mypage-section personal-info-section">
                <h2 className="section-title"><FaLock /> {t('personal_info_title', '개인 정보 (비밀번호 확인 필요)')}</h2>
                {!isPersonalInfoVerified ? (
                    <PersonalInfoVerification onVerificationSuccess={handlePersonalInfoVerificationSuccess} />
                ) : (
                    <div className="verified-info-content">
                        {isEditingPersonalInfo ? (
                            <div className="edit-form">
                                <div className="input-group">
                                    <label htmlFor="phoneNumber"><FaPhone /> {t('phone_number_label', '전화번호')}:</label>
                                    <input
                                        type="text"
                                        id="phoneNumber"
                                        value={newPhoneNumber}
                                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                                        placeholder={t('phone_number_placeholder', '010-XXXX-XXXX')}
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="region"><FaMapMarkerAlt /> {t('region_label', '거주 지역')}:</label>
                                    <input
                                        type="text"
                                        id="region"
                                        value={newRegion}
                                        onChange={(e) => setNewRegion(e.target.value)}
                                        placeholder={t('region_placeholder', '예: 서울특별시')}
                                    />
                                </div>
                                {/* ✨ 관심사는 이제 기본 정보 섹션에서 수정하므로 여기서는 제거합니다. */}
                                {/* <div className="input-group"> ... (관심사 체크박스) ... </div> */}

                                <div className="form-actions">
                                    <button onClick={handleSavePersonalInfo} className="save-button">{t('save_button', '저장')}</button>
                                    <button onClick={handleCancelPersonalInfoEdit} className="cancel-button">{t('cancel_button', '취소')}</button>
                                </div>

                                <div className="password-change-section">
                                    <h3><FaKey /> {t('change_password_title', '비밀번호 변경')}</h3>
                                    <div className="input-group">
                                        <label htmlFor="current-password-change">{t('current_password_label', '현재 비밀번호')}:</label>
                                        <input
                                            type="password"
                                            id="current-password-change"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder={t('current_password_placeholder', '현재 비밀번호를 입력하세요')}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="new-password">{t('new_password_label', '새로운 비밀번호')}:</label>
                                        <input
                                            type="password"
                                            id="new-password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder={t('new_password_placeholder', '새로운 비밀번호를 입력하세요')}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="confirm-new-password">{t('confirm_new_password_label', '새로운 비밀번호 확인')}:</label>
                                        <input
                                            type="password"
                                            id="confirm-new-password"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            placeholder={t('confirm_new_password_placeholder', '새로운 비밀번호를 다시 입력하세요')}
                                        />
                                    </div>
                                    {passwordError && <p className="error-message">{passwordError}</p>}
                                    <button onClick={handleChangePassword} className="change-password-button">{t('change_password_button', '비밀번호 변경')}</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="info-item">
                                    <span className="info-label"><FaPhone /> {t('phone_number_label', '전화번호')}:</span>
                                    <span className="info-value">{userData.phoneNumber}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label"><FaMapMarkerAlt /> {t('region_label', '거주 지역')}:</span>
                                    <span className="info-value">{userData.region}</span>
                                </div>
                                <button onClick={handleEditPersonalInfo} className="edit-button">
                                    <FaEdit /> {t('edit_info_button', '정보 수정')}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </section>

            <section className="mypage-section my-posts-section">
                <h2 className="section-title"><FaClipboardList /> {t('my_posts_title', '내가 작성한 글')}</h2>
                {userPosts.length > 0 ? (
                    <ul className="post-list">
                        {userPosts.map(post => (
                            <li key={post.id} className="post-item">
                                <span className="post-category">[{post.category}]</span>
                                <a href={`/community/post/${post.id}`} className="post-title">{post.title}</a>
                                <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-posts-message">{t('no_posts_yet', '아직 작성한 글이 없습니다.')}</p>
                )}
            </section>
        </div>
    );
}

export default withTranslation()(MyPage);
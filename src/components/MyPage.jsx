// frontend/src/components/MyPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import { FaUserCircle, FaEnvelope, FaTag, FaPhone, FaMapMarkerAlt, FaEdit, FaLock, FaClipboardList, FaKey, FaBell, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { useNotifications } from '../contexts/NotificationContext';
import PersonalInfoVerification from './PersonalInfoVerification';
import '../mypage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const interestOptions = ["음악", "음식", "전통문화", "연극", "야시장", "전통", "야간", "콘서트", "한복"];
const regionOptions = ["서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시", "울산광역시", "세종특별자치시", "경기도", "강원특별자치도", "충청북도", "충청남도", "전북특별자치도", "전라남도", "경상북도", "경상남도", "제주특별자치도"];

function MyPage({ t }) {
    const navigate = useNavigate();
    const { notifications, dismissNotification, readAllNotifications } = useNotifications();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);

    const [currentPostsPage, setCurrentPostsPage] = useState(1);
    const postsPerPage = 6;
    const [currentNotifsPage, setCurrentNotifsPage] = useState(1);
    const notifsPerPage = 6;

    // ... (isPersonalInfoVerified 등 다른 state는 그대로)
    const [isPersonalInfoVerified, setIsPersonalInfoVerified] = useState(false);
    const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
    const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
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
        const fetchMyPageData = async (token) => {
            try {
                const [profileRes, postsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/mypage/profile`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_BASE_URL}/api/mypage/posts`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setUserData(profileRes.data);
                setNewPhoneNumber(profileRes.data.phoneNumber || '');
                setNewRegion(profileRes.data.region || '');
                setNewInterests(profileRes.data.interests || []);
                setUserPosts(postsRes.data.posts);
            } catch (err) {
                console.error("마이페이지 데이터 로딩 실패:", err);
                setError(t('failed_to_load_profile', '마이페이지 정보를 불러오는 데 실패했습니다.'));
            } finally {
                setLoading(false);
            }
        };
        fetchMyPageData(token);
    }, [navigate, t]);

    const handleDismiss = (notificationId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        dismissNotification(notificationId);
    };

    // ... (프로필, 게시글 관련 핸들러 함수는 모두 그대로 유지)
    const handlePersonalInfoVerificationSuccess = () => setIsPersonalInfoVerified(true);
    const handleEditBasicInfo = () => setIsEditingBasicInfo(true);
    const handleCancelBasicEdit = () => { setIsEditingBasicInfo(false); setNewInterests(userData.interests || []); };
    const handleSaveBasicInfo = async () => { const token = localStorage.getItem('token'); if (!token) return; try { await axios.put(`${API_BASE_URL}/api/mypage/profile/edit`, { phoneNumber: userData.phoneNumber, region: userData.region, interests: newInterests }, { headers: { Authorization: `Bearer ${token}` } }); alert(t('interests_update_success', '관심사 정보가 성공적으로 업데이트되었습니다.')); setIsEditingBasicInfo(false); setUserData(d => ({ ...d, interests: newInterests })); } catch (err) { alert(t('interests_update_fail', `관심사 업데이트에 실패했습니다: ${err.response?.data?.error || err.message}`)); } };
    const handleEditPersonalInfo = () => { setIsEditingPersonalInfo(true); setPasswordError(''); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); };
    const handleCancelPersonalInfoEdit = () => { setIsEditingPersonalInfo(false); setNewPhoneNumber(userData.phoneNumber || ''); setNewRegion(userData.region || ''); setPasswordError(''); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); };
    const handleInterestChange = (e) => { const { value, checked } = e.target; setNewInterests(prev => checked ? [...prev, value] : prev.filter(item => item !== value)); };
    const handleSavePersonalInfo = async () => { const token = localStorage.getItem('token'); if (!token) return; if (!newPhoneNumber || !newRegion) { alert(t('phone_region_required', '전화번호와 거주 지역은 필수 항목입니다.')); return; } if (!/^\d{3}-\d{3,4}-\d{4}$/.test(newPhoneNumber)) { alert(t('validate_phone_format', '올바른 전화번호 형식(예: 010-1234-5678)이 아닙니다.')); return; } try { await axios.put(`${API_BASE_URL}/api/mypage/profile/edit`, { phoneNumber: newPhoneNumber, region: newRegion, interests: userData.interests }, { headers: { Authorization: `Bearer ${token}` } }); alert(t('profile_update_success', '프로필 정보가 성공적으로 업데이트되었습니다.')); setIsEditingPersonalInfo(false); setUserData(d => ({ ...d, phoneNumber: newPhoneNumber, region: newRegion })); } catch (err) { alert(t('profile_update_fail', `프로필 업데이트에 실패했습니다: ${err.response?.data?.error || err.message}`)); } };
    const handleChangePassword = async () => { const token = localStorage.getItem('token'); if (!token) return; if (!currentPassword) { setPasswordError(t('enter_current_password', '현재 비밀번호를 입력해주세요.')); return; } if (!newPassword || !confirmNewPassword) { setPasswordError(t('enter_new_password', '새로운 비밀번호와 확인 비밀번호를 모두 입력해주세요.')); return; } if (newPassword !== confirmNewPassword) { setPasswordError(t('password_mismatch', '새로운 비밀번호가 일치하지 않습니다.')); return; } if (newPassword === currentPassword) { setPasswordError(t('new_password_same_as_old', '새로운 비밀번호는 현재 비밀번호와 달라야 합니다.')); return; } if (newPassword.length < 6) { setPasswordError(t('password_too_short', '새로운 비밀번호는 최소 6자 이상이어야 합니다.')); return; } setPasswordError(''); try { await axios.put(`${API_BASE_URL}/api/mypage/change-password`, { currentPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } }); alert(t('password_change_success', '비밀번호가 성공적으로 변경되었습니다.')); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); setIsEditingPersonalInfo(false); } catch (err) { const errorMessage = err.response?.data?.error || err.message; if (err.response?.status === 401 && errorMessage.includes('올바르지 않습니다')) { setPasswordError(t('incorrect_current_password', '현재 비밀번호가 올바르지 않습니다.')); } else { setPasswordError(t('password_change_fail', `비밀번호 변경에 실패했습니다: ${errorMessage}`)); } } };


    // 게시글 페이지네이션 로직
    const indexOfLastPost = currentPostsPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = userPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPostsPages = Math.ceil(userPosts.length / postsPerPage);

    // ▼▼▼▼▼ [수정] '읽지 않은' 알림만 필터링하여 목록과 페이지네이션을 구성합니다. ▼▼▼▼▼
    const unreadNotifications = notifications.filter(n => !n.is_read);
    const indexOfLastNotif = currentNotifsPage * notifsPerPage;
    const indexOfFirstNotif = indexOfLastNotif - notifsPerPage;
    const currentNotifs = unreadNotifications.slice(indexOfFirstNotif, indexOfLastNotif);
    const totalNotifsPages = Math.ceil(unreadNotifications.length / notifsPerPage);

    if (loading) return <div className="mypage-container"><p>로딩 중...</p></div>;
    if (error) return <div className="mypage-container"><p className="error-message">{error}</p></div>;
    if (!userData) return <div className="mypage-container"><p>사용자 데이터를 찾을 수 없습니다.</p></div>;

    return (
        <div className="mypage-container">
            <h1 className="mypage-title">{t('mypage_title', '마이페이지')}</h1>

            {/* 프로필 및 게시글 섹션은 이전과 동일 (생략) */}
            <section className="mypage-section basic-info-section">
                <h2 className="section-title"><FaUserCircle /> {t('basic_info_title', '기본 정보')}</h2>
                <div className="info-item"><span className="info-label"><FaEnvelope /> {t('username_label', '아이디')}:</span><span className="info-value">{userData.username}</span></div>
                {!isEditingBasicInfo ? (<div className="info-item"> <span className="info-label"><FaTag /> {t('interests_label', '관심사')}:</span> <span className="info-value">{Array.isArray(userData.interests) && userData.interests.length > 0 ? userData.interests.join(', ') : t('no_interests', '관심사 없음')}</span> <button onClick={handleEditBasicInfo} className="edit-button-inline"><FaEdit /></button> </div>) : (<div className="edit-form basic-info-edit-form"> <div className="input-group"><label><FaTag /> {t('interests_label', '관심사')}:</label><div className="interest-checkboxes">{interestOptions.map(interest => (<label key={interest}><input type="checkbox" value={interest} checked={newInterests.includes(interest)} onChange={handleInterestChange} />{interest}</label>))}</div></div> <div className="form-actions"><button onClick={handleSaveBasicInfo} className="save-button">{t('save_button', '저장')}</button><button onClick={handleCancelBasicEdit} className="cancel-button">{t('cancel_button', '취소')}</button></div> </div>)}
            </section>

            <section className="mypage-section personal-info-section">
                <h2 className="section-title"><FaLock /> {t('personal_info_title', '개인 정보 (비밀번호 확인 필요)')}</h2>
                {!isPersonalInfoVerified ? <PersonalInfoVerification onVerificationSuccess={handlePersonalInfoVerificationSuccess} /> : (<div className="verified-info-content"> {isEditingPersonalInfo ? (<div className="edit-form"> <div className="input-group"><label htmlFor="phoneNumber"><FaPhone /> {t('phone_number_label', '전화번호')}:</label><input type="text" id="phoneNumber" value={newPhoneNumber} onChange={(e) => setNewPhoneNumber(e.target.value)} placeholder={t('phone_number_placeholder', '010-XXXX-XXXX')} /></div> <div className="input-group"><label htmlFor="region"><FaMapMarkerAlt /> {t('region_label', '거주 지역')}:</label><select id="region" name="region" value={newRegion} onChange={(e) => setNewRegion(e.target.value)}>{regionOptions.map(o => (<option key={o} value={o}>{o}</option>))}</select></div> <div className="form-actions"><button onClick={handleSavePersonalInfo} className="save-button">{t('save_button', '저장')}</button><button onClick={handleCancelPersonalInfoEdit} className="cancel-button">{t('cancel_button', '취소')}</button></div> <div className="password-change-section"> <h3><FaKey /> {t('change_password_title', '비밀번호 변경')}</h3> <div className="input-group"><label htmlFor="current-password-change">{t('current_password_label', '현재 비밀번호')}:</label><input type="password" id="current-password-change" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div> <div className="input-group"><label htmlFor="new-password">{t('new_password_label', '새로운 비밀번호')}:</label><input type="password" id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div> <div className="input-group"><label htmlFor="confirm-new-password">{t('confirm_new_password_label', '새로운 비밀번호 확인')}:</label><input type="password" id="confirm-new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} /></div> {passwordError && <p className="error-message">{passwordError}</p>} <button onClick={handleChangePassword} className="change-password-button">{t('change_password_button', '비밀번호 변경')}</button> </div> </div>) : (<> <div className="info-item"><span className="info-label"><FaPhone /> {t('phone_number_label', '전화번호')}:</span><span className="info-value">{userData.phoneNumber}</span></div> <div className="info-item"><span className="info-label"><FaMapMarkerAlt /> {t('region_label', '거주 지역')}:</span><span className="info-value">{userData.region}</span></div> <button onClick={handleEditPersonalInfo} className="edit-button"><FaEdit /> {t('edit_info_button', '정보 수정')}</button> </>)} </div>)}
            </section>

            <section className="mypage-section my-posts-section">
                <h2 className="section-title"><FaClipboardList /> {t('my_posts_title', '내가 작성한 글')}</h2>
                {userPosts.length > 0 ? (
                    <>
                        <div className="mypage-simple-list">
                            {currentPosts.map(post => (
                                <Link to={`/community/post/${post.id}`} key={post.id} className="mypage-list-item">
                                    <span className="item-category">[{post.category}]</span>
                                    <span className="item-title">{post.title}</span>
                                    <span className="item-meta">
                                        <FaCalendarAlt /> {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                </Link>
                            ))}
                        </div>
                        {totalPostsPages > 1 && (
                            <div className="pagination-container">
                                {Array.from({ length: totalPostsPages }, (_, i) => i + 1).map(page => (
                                    <button key={page} onClick={() => setCurrentPostsPage(page)} className={`page-button ${currentPostsPage === page ? 'active' : ''}`}>{page}</button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (<p className="no-content-message">{t('no_posts_yet', '아직 작성한 글이 없습니다.')}</p>)}
            </section>

            <section className="mypage-section notifications-section">
                <div className="section-header">
                    <h2 className="section-title"><FaBell /> {t('notifications_title', '알림 내역')}</h2>
                    {unreadNotifications.length >= 2 && (
                        <button onClick={readAllNotifications} className="section-header-button">모두 읽음</button>
                    )}
                </div>

                {unreadNotifications.length > 0 ? (
                    <>
                        <div className="mypage-simple-list">
                            {currentNotifs.map(n => (
                                <div key={n.id} className="mypage-list-item unread">
                                    <button onClick={(e) => handleDismiss(n.id, e)} className="item-dismiss-button" title="알림 확인">
                                        <FaTimes />
                                    </button>
                                    <Link to={`/community/post/${n.post_id}`} className="item-content-wrapper" onClick={() => handleDismiss(n.id)}>
                                        <span className="item-title">
                                            {n.type === 'LIKE' && `👍 ${n.source_username}님이 회원님의 "${n.post_title}" 게시글을 좋아합니다.`}
                                            {n.type === 'COMMENT' && `💬 ${n.source_username}님이 회원님의 "${n.post_title}" 게시글에 댓글을 남겼습니다.`}
                                            {n.type === 'POPULAR' && `🎉 회원님의 "${n.post_title}" 게시글이 인기 게시물로 선정되었습니다!`}
                                        </span>
                                        <span className="item-meta">{new Date(n.createdAt).toLocaleString()}</span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                        {totalNotifsPages > 1 && (
                            <div className="pagination-container">
                                {Array.from({ length: totalNotifsPages }, (_, i) => i + 1).map(page => (
                                    <button key={page} onClick={() => setCurrentNotifsPage(page)} className={`page-button ${currentNotifsPage === page ? 'active' : ''}`}>{page}</button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <p className="no-content-message">{t('no_notifications_yet', '새로운 알림이 없습니다.')}</p>
                )}
            </section>
        </div>
    );
}

export default withTranslation()(MyPage);
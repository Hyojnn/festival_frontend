// frontend/src/components/NavBar.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { FaBell, FaTimes } from 'react-icons/fa';
// ▼▼▼▼▼ [수정] useNotifications 훅을 import 합니다. ▼▼▼▼▼
import { useNotifications } from '../contexts/NotificationContext';
import '../home.css';

const NavBar = ({ toggleSearchOverlay }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // ▼▼▼▼▼ [수정] 전역 상태에서 알림 데이터와 함수를 가져옵니다. ▼▼▼▼▼
    const { notifications, dismissNotification, readAllNotifications } = useNotifications();

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
    const [userName, setUserName] = useState("");
    const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const [isNotifDropdownOpen, setNotifDropdownOpen] = useState(false);

    const notifRef = useRef(null);
    const profileRef = useRef(null);
    const langRef = useRef(null);

    // ▼▼▼▼▼ [제거] NavBar 내의 자체 알림 fetch 로직은 Context로 이동했으므로 제거합니다. ▼▼▼▼▼

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) setNotifDropdownOpen(false);
            if (profileRef.current && !profileRef.current.contains(event.target)) setProfileDropdownOpen(false);
            if (langRef.current && !langRef.current.contains(event.target)) setIsLangDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const updateAuthState = () => {
            const currentIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            setIsLoggedIn(currentIsLoggedIn);
            setUserName(currentIsLoggedIn ? localStorage.getItem("userName") || "" : "");
        };
        updateAuthState();
        window.addEventListener('storage', updateAuthState);
        setProfileDropdownOpen(false); setIsLangDropdownOpen(false); setNotifDropdownOpen(false);
        return () => window.removeEventListener('storage', updateAuthState);
    }, [location]);

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false); setUserName(""); setProfileDropdownOpen(false);
        // 로그아웃 시 알림을 수동으로 비워줄 필요가 없습니다. Context가 알아서 처리합니다.
        navigate("/");
    };

    const handleSearchIconClick = (e) => { e.preventDefault(); if (toggleSearchOverlay) toggleSearchOverlay(); };
    const changeLanguage = (lng) => { i18n.changeLanguage(lng); setIsLangDropdownOpen(false); };

    const unreadNotifications = notifications.filter(n => !n.is_read);
    const unreadCount = unreadNotifications.length;
    const languages = [{ code: 'ko', name: t('lang_korean', '한국어') }, { code: 'en', name: t('lang_english', 'English') }, { code: 'ja', name: t('lang_japanese', '日本語') }, { code: 'zh', name: t('lang_chinese', '中文') }];

    return (
        <header className="main-header">
            <div className="top-bar">
                <div className="logo"><Link to="/" className="logo-text">🎪 FESTIVAL.TOWN</Link></div>
                <nav className="main-nav">
                    <NavLink to="/" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>{t('nav_home')}</NavLink>
                    <NavLink to="/themes" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>{t('nav_themes')}</NavLink>
                    <NavLink to="/regions" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>{t('nav_regions')}</NavLink>
                    <NavLink to="/festivals" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>{t('nav_all_festivals')}</NavLink>
                    <NavLink to="/community" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>{t('nav_community')}</NavLink>
                </nav>
                <div className="header-icons">
                    <button onClick={handleSearchIconClick} className="icon-button" aria-label={t('nav_search_alt')}><img src={`${process.env.PUBLIC_URL}/images/search.svg`} alt={t('nav_search_alt')} /></button>
                    <Link to="/map" className="icon-button" aria-label={t('nav_map')}><img src={`${process.env.PUBLIC_URL}/images/map.svg`} alt={t('nav_map')} /></Link>
                    {isLoggedIn ? (
                        <>
                            <div className="profile-menu-container" ref={notifRef}>
                                <button onClick={() => setNotifDropdownOpen(p => !p)} className="icon-button notification-button" aria-label="알림">
                                    <FaBell />
                                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                </button>
                                {isNotifDropdownOpen && (
                                    <div className="profile-dropdown notification-dropdown">
                                        <div className="dropdown-header">
                                            <h4>알림</h4>
                                            {/* ▼▼▼▼▼ [수정] 전역 함수 사용 ▼▼▼▼▼ */}
                                            {unreadCount >= 2 && <button onClick={readAllNotifications} className="read-all-btn">모두 읽음</button>}
                                        </div>
                                        <div className="notification-list">
                                            {unreadCount > 0 ? unreadNotifications.map(n => (
                                                <div key={n.id} className="notification-item-wrapper">
                                                    {/* ▼▼▼▼▼ [수정] 전역 함수 사용 ▼▼▼▼▼ */}
                                                    <button className="notification-dismiss-btn" onClick={() => dismissNotification(n.id)} title="알림 닫기">
                                                        <FaTimes />
                                                    </button>
                                                    <Link to={`/community/post/${n.post_id}`} className="notification-link" onClick={() => dismissNotification(n.id)}>
                                                        {n.type === 'LIKE' && `👍 ${n.source_username}님이 "${n.post_title}" 게시글을 좋아합니다.`}
                                                        {n.type === 'COMMENT' && `💬 ${n.source_username}님이 "${n.post_title}" 게시글에 댓글을 남겼습니다.`}
                                                        {n.type === 'POPULAR' && `🎉 회원님의 "${n.post_title}" 게시글이 인기 게시물로 선정되었습니다!`}
                                                    </Link>
                                                </div>
                                            )) : <div className="no-notifications">새로운 알림이 없습니다.</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="profile-menu-container" ref={profileRef}>
                                <button onClick={() => setProfileDropdownOpen(p => !p)} className="icon-button profile-button"><img src={`${process.env.PUBLIC_URL}/images/account_circle.svg`} alt={t('nav_profile_alt')} /></button>
                                {isProfileDropdownOpen && (<div className="profile-dropdown"> <div className="dropdown-user-info">{t('user_greeting', { name: userName })}</div> <Link to="/mypage" className="dropdown-item-button">{t('nav_mypage', "마이페이지")}</Link> <button onClick={handleLogout} className="dropdown-item-button logout">{t('nav_logout')}</button> </div>)}
                            </div>
                        </>
                    ) : (<Link to="/login" className="icon-button" aria-label={t('nav_login')}><img src={`${process.env.PUBLIC_URL}/images/account_circle.svg`} alt={t('nav_login')} /></Link>)}
                    <div className="language-switcher-container profile-menu-container" ref={langRef}>
                        <button onClick={() => setIsLangDropdownOpen(p => !p)} className="icon-button language-button"><img src={`${process.env.PUBLIC_URL}/images/language.svg`} alt={t('nav_language_alt')} /></button>
                        {isLangDropdownOpen && (<div className="profile-dropdown language-options"> {languages.map(lang => (<button key={lang.code} onClick={() => changeLanguage(lang.code)} className={`dropdown-item-button ${i18n.language.startsWith(lang.code) ? 'active' : ''}`}>{lang.name}</button>))} </div>)}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NavBar;
// frontend/src/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
// import './NavBar.css'; // 이 줄은 주석 처리 또는 삭제 (home.css 사용) - 기존 주석 유지
// const API_BASE_URL = process.env.REACT_APP_API_URL; // NavBar.jsx에서 API_BASE_URL은 사용되지 않으므로 ESLint 경고 제거를 위해 주석 처리 또는 삭제 - 기존 주석 유지

const NavBar = ({ toggleSearchOverlay }) => {
    const { t, i18n } = useTranslation();
    const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // 현재 경로 정보를 가져옵니다.

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
    const [userName, setUserName] = useState(isLoggedIn ? localStorage.getItem("userName") || "" : "");

    useEffect(() => {
        const updateAuthState = () => {
            const currentIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            setIsLoggedIn(currentIsLoggedIn);
            setUserName(currentIsLoggedIn ? localStorage.getItem("userName") || "" : "");
        };

        updateAuthState(); // 컴포넌트 마운트 시 초기 상태 설정

        // 다른 탭/창에서의 localStorage 변경을 감지합니다.
        window.addEventListener('storage', updateAuthState);

        // location 변경될 때마다 드롭다운 닫기
        setProfileDropdownOpen(false);
        setIsLangDropdownOpen(false);

        return () => window.removeEventListener('storage', updateAuthState);
    }, [location]); // useEffect의 의존성 배열에 location을 추가합니다.

    const handleLogout = () => {
        localStorage.clear(); // 모든 localStorage 데이터 삭제
        setIsLoggedIn(false);
        setUserName("");
        setProfileDropdownOpen(false); // 드롭다운 닫기
        navigate("/"); // 홈으로 이동
        // window.location.reload(); // 불필요한 새로고침 제거, navigate만으로 충분
    };

    const handleSearchIconClick = (e) => {
        e.preventDefault();
        if (toggleSearchOverlay) {
            toggleSearchOverlay();
        } else {
            console.warn("toggleSearchOverlay function not provided to NavBar");
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsLangDropdownOpen(false);
    };

    const languages = [
        { code: 'ko', name: t('lang_korean', '한국어') },
        { code: 'en', name: t('lang_english', 'English') },
        { code: 'ja', name: t('lang_japanese', '日本語') },
        { code: 'zh', name: t('lang_chinese', '中文') },
    ];

    return (
        <header className="main-header">
            <div className="top-bar">
                <div className="logo">
                    <Link to="/" className="logo-text">
                        🎪 FESTIVAL.TOWN
                    </Link>
                </div>
                <nav className="main-nav">
                    <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{t('nav_home')}</NavLink>
                    <NavLink to="/themes" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{t('nav_themes')}</NavLink>
                    <NavLink to="/regions" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{t('nav_regions')}</NavLink>
                    <NavLink to="/festivals" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{t('nav_all_festivals')}</NavLink>
                    <NavLink to="/community" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{t('nav_community')}</NavLink>
                </nav>
                <div className="header-icons">
                    <button onClick={handleSearchIconClick} className="icon-button" aria-label={t('nav_search_alt')}>
                        <img src={`${process.env.PUBLIC_URL}/images/search.svg`} alt={t('nav_search_alt')} />
                    </button>
                    <Link to="/map" className="icon-button" aria-label={t('nav_map')}>
                        <img src={`${process.env.PUBLIC_URL}/images/map.svg`} alt={t('nav_map')} />
                    </Link>
                    {isLoggedIn ? (
                        <div className="profile-menu-container">
                            <button onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)} className="icon-button profile-button" aria-haspopup="true" aria-expanded={isProfileDropdownOpen} aria-label={t('nav_profile_alt')}>
                                <img src={`${process.env.PUBLIC_URL}/images/account_circle.svg`} alt={t('nav_profile_alt')} />
                            </button>
                            {isProfileDropdownOpen && (
                                <div className="profile-dropdown" role="menu">
                                    <div className="dropdown-user-info">{t('user_greeting', { name: userName })}</div>
                                    {/* ✨ 마이페이지 링크가 이미 존재합니다. */}
                                    <Link to="/mypage" className="dropdown-item-button" onClick={() => setProfileDropdownOpen(false)}>{t('nav_mypage', "마이페이지")}</Link>
                                    <button onClick={handleLogout} role="menuitem" className="dropdown-item-button logout">
                                        {t('nav_logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="icon-button" aria-label={t('nav_login')}>
                            <img src={`${process.env.PUBLIC_URL}/images/account_circle.svg`} alt={t('nav_login')} />
                        </Link>
                    )}
                    <div className="language-switcher-container profile-menu-container">
                        <button onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} className="icon-button language-button" aria-label={t('nav_language_alt')} aria-haspopup="true" aria-expanded={isLangDropdownOpen}>
                            <img src={`${process.env.PUBLIC_URL}/images/language.svg`} alt={t('nav_language_alt')} />
                        </button>
                        {isLangDropdownOpen && (
                            <div className="profile-dropdown language-options" role="menu">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang.code)}
                                        role="menuitem"
                                        className={`dropdown-item-button ${i18n.language.startsWith(lang.code) ? 'active' : ''}`}
                                        disabled={i18n.language.startsWith(lang.code)}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
export default NavBar;
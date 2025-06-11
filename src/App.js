// frontend/src/App.js
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from './components/home';
import Login from './components/Login';
import Register from './components/Register';
import Festival from './components/festival';
import Theme from './components/Theme';
import RegionsListPage from './components/RegionsListPage';
import RegionPage from './components/RegionPage';
import FindAccount from './components/FindAccount';
import SearchOverlay from './components/SearchOverlay';
import NavBar from './components/NavBar';
import BannerThemeFestivalsPage from './components/BannerThemeFestivalsPage';
import Map from './components/map';
import MyPage from './components/MyPage'; // ✨ MyPage 컴포넌트 import
import SupportForm from './components/apply';
import { NotificationProvider } from './contexts/NotificationContext';

const CommunityPage = lazy(() => import('./components/CommunityPage'));
const PostDetailPage = lazy(() => import('./components/PostDetailPage'));
const WritePostPage = lazy(() => import('./components/WritePostPage'));
const NoticeListPage = lazy(() => import('./components/NoticeListPage'));
const TravelTipListPage = lazy(() => import('./components/TravelTipListPage'));
const InfoTravelTipsPage = lazy(() => import('./components/InfoTravelTipsPage'));
const InfoSafetyGuidePage = lazy(() => import('./components/InfoSafetyGuidePage'));
const AllPostsListPage = lazy(() => import('./components/AllPostsListPage'));


const LoadingFallback = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading translations...
    </div>
);

function AppContent() {
    const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
    const location = useLocation();
    const storedUserId = localStorage.getItem("userId") || null;

    const toggleSearchOverlay = () => {
        setIsSearchOverlayOpen(prev => !prev);
    };

    useEffect(() => {
        if (isSearchOverlayOpen) {
            setIsSearchOverlayOpen(false);
        }
    }, [location]);

    useEffect(() => {
        if (isSearchOverlayOpen) {
            document.body.classList.add('search-overlay-active');
        } else {
            document.body.classList.remove('search-overlay-active');
        }
        return () => {
            document.body.classList.remove('search-overlay-active');
        };
    }, [isSearchOverlayOpen]);

    return (
        <>
            <NavBar toggleSearchOverlay={toggleSearchOverlay} />
            <div className="main-content-area" style={{ paddingTop: '118px' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Register />} />
                    <Route path="/festivals" element={<Festival />} />
                    <Route path="/themes" element={<Theme />} />
                    <Route path="/themes/:themeName" element={<Theme />} />
                    <Route path="/regions" element={<RegionsListPage />} />
                    <Route path="/region/:regionName" element={<RegionPage />} />
                    <Route path="/find-account" element={<FindAccount />} />
                    <Route path="/banner-theme/:themeKey" element={<BannerThemeFestivalsPage />} />
                    <Route path="/map" element={<Map />} />
                    <Route path="/apply" element={<SupportForm userId={storedUserId} />} />
                    <Route path="/mypage" element={<MyPage />} /> {/* ✨ 마이페이지 라우트 추가 */}

                    {/* 커뮤니티 관련 라우트 */}
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/community/post/:id" element={<PostDetailPage />} />
                    <Route path="/community/write" element={<WritePostPage />} />
                    <Route path="/community/notices" element={<NoticeListPage />} />
                    <Route path="/community/tips" element={<TravelTipListPage />} />
                    <Route path="/community/posts" element={<AllPostsListPage />} />

                    {/* 정보성 페이지 라우트 */}
                    <Route path="/info/travel_tips" element={<InfoTravelTipsPage />} />
                    <Route path="/info/safety_guide" element={<InfoSafetyGuidePage />} />

                </Routes>
            </div>
            <SearchOverlay isOpen={isSearchOverlayOpen} onClose={toggleSearchOverlay} />
        </>
    );
}

function App() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            {/* ▼▼▼▼▼ [확인!] Router가 NotificationProvider 안에 있는지 확인하세요! ▼▼▼▼▼ */}
            <NotificationProvider>
                <Router>
                    <AppContent />
                </Router>
            </NotificationProvider>
        </Suspense>
    );
}

export default App;
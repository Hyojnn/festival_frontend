// frontend/src/components/home.jsx

import React, { Component, createRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../home.css";
import { withTranslation } from 'react-i18next';
//import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import {
    FaChevronLeft, FaChevronRight, FaTicketAlt, FaMapMarkedAlt,
    FaUsers, FaLightbulb, FaRegCalendarAlt, FaHandsHelping, FaInfoCircle,
    FaRegStar, FaComments, FaSearchLocation, FaPlaneDeparture
} from 'react-icons/fa';


const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


// 날짜 문자열(YYYYMMDD)을 Date 객체로 변환하는 헬퍼 함수
const parseApiDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.length !== 8) return null;
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JS month is 0-indexed
    const day = parseInt(dateStr.substring(6, 8), 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month, day);
};

// 날짜를 "YYYY.MM.DD" 형식으로 포맷하는 헬퍼 함수
const formatDateToDots = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.length !== 8) return "";
    return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
};

// --- 정적 데이터 (홈 화면에 필요한 데이터는 여기서 정의) ---
const mainSliderData = [
    { image: "/images/slide1.jpg", title_key: "home_slide1_winter_title", desc_key: "home_slide1_winter_desc", buttonText_key: "slide_button_text", themeServerKey: "winter_snow" },
    { image: "/images/slide2.jpg", title_key: "home_slide2_summer_title", desc_key: "home_slide2_summer_desc", buttonText_key: "slide_button_text", themeServerKey: "summer_music" },
    { image: "/images/slide3.jpg", title_key: "home_slide3_tradition_title", desc_key: "home_slide3_tradition_desc", buttonText_key: "slide_button_text", themeServerKey: "traditional_culture" },
    { image: "/images/slide4.jpg", title_key: "home_slide4_food_title", desc_key: "home_slide4_food_desc", buttonText_key: "slide_button_text", themeServerKey: "food_festival" },
];

const curationTabsData = [
    { id: 'curation1', titleKey: 'home_curation_ai_title', descriptionKey: 'home_curation_ai_desc', icon: <FaLightbulb size={30} />, link: '/festivals?filter=ai_recommended', ctaKey: 'home_curation_cta_ai' },
    { id: 'curation2', titleKey: 'home_curation_hotspot_title', descriptionKey: 'home_curation_hotspot_desc', icon: <FaMapMarkedAlt size={30} />, link: '/regions', ctaKey: 'home_curation_cta_region' },
    { id: 'curation3', titleKey: 'home_curation_planner_title', descriptionKey: 'home_curation_planner_desc', icon: <FaRegCalendarAlt size={30} />, link: '/themes', ctaKey: 'home_curation_cta_theme' }
];

const serviceBannersData = [
    { id: 'sb1', titleKey: 'home_service_banner_1_title', descriptionKey: 'home_service_banner_1_desc', image: '/images/service_banner_1.jpg', link: '/info/safety_guide' },
    { id: 'sb2', titleKey: 'home_service_banner_2_title', descriptionKey: 'home_service_banner_2_desc', image: '/images/service_banner_2.jpg', link: '/info/travel_tips' }
];

const allAvailableRegions = [
    { name: "서울특별시", description: "다채로운 매력의 도시", image: `${process.env.PUBLIC_URL}/images/regions/seoul.png` },
    { name: "부산광역시", description: "열정적인 축제의 바다", image: `${process.env.PUBLIC_URL}/images/regions/busan.png` },
    { name: "대구광역시", description: "근대골목과 더위의 도시", image: `${process.env.PUBLIC_URL}/images/regions/daegu.png` },
    { name: "인천광역시", description: "과거와 현재가 공존하는 항구도시", image: `${process.env.PUBLIC_URL}/images/regions/incheon.png` },
    { name: "광주광역시", description: "예술과 민주화의 도시", image: `${process.env.PUBLIC_URL}/images/regions/gwangju.png` },
    { name: "대전광역시", description: "과학과 교통의 중심지", image: `${process.env.PUBLIC_URL}/images/regions/daejeon.png` },
    { name: "울산광역시", description: "산업과 자연의 조화", image: `${process.env.PUBLIC_URL}/images/regions/ulsan.png` },
    { name: "세종특별자치시", description: "행정 중심 복합도시", image: `${process.env.PUBLIC_URL}/images/regions/sejong.png` },
    { name: "경기도", description: "역사와 미래가 함께하는 곳", image: `${process.env.PUBLIC_URL}/images/regions/gyeonggi.png` },
    { name: "강원특별자치도", description: "설렘 가득한 산과 바다", image: `${process.env.PUBLIC_URL}/images/regions/gangwon.png` },
    { name: "충청북도", description: "중원의 문화유산과 자연", image: `${process.env.PUBLIC_URL}/images/regions/chungbuk.png` },
    { name: "충청남도", description: "백제의 숨결이 살아있는", image: `${process.env.PUBLIC_URL}/images/regions/chungnam.png` },
    { name: "전북특별자치도", description: "전통과 맛의 중심", image: `${process.env.PUBLIC_URL}/images/regions/jeonbuk.png` },
    { name: "전라남도", description: "맛과 멋의 고장", image: `${process.env.PUBLIC_URL}/images/regions/jeonnam.png` },
    { name: "경상북도", description: "유구한 역사와 문화", image: `${process.env.PUBLIC_URL}/images/regions/gyeongbuk.png` },
    { name: "경상남도", description: "역동적인 산업과 아름다운 자연", image: `${process.env.PUBLIC_URL}/images/regions/gyeongnam.png` },
    { name: "제주특별자치도", description: "자연의 아름다움과 신비", image: `${process.env.PUBLIC_URL}/images/regions/jeju.png` },
];

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
            userName: localStorage.getItem("isLoggedIn") === "true" ? (localStorage.getItem("userName") || "") : "",
            userRegion: localStorage.getItem("isLoggedIn") === "true" ? (localStorage.getItem("userRegion") || "") : "",
            recommendations: [],
            loadingRecs: false,
            recError: null,
            currentSlide: 0,

            upcomingFestivals: [],
            loadingUpcoming: true,
            upcomingError: null,
            popularPosts: [],

            communityHighlights: [],
            loadingHighlights: true,
            highlightsError: null,

            hottestTips: [],
            loadingTips: true,
            tipsError: null,

            displayedRegions: [],
            loadingRegions: false,
            regionsError: null,
        };

        this.slides = mainSliderData;
        this.slideInterval = null;
        this.nextSlide = this.nextSlide.bind(this);
        this.prevSlide = this.prevSlide.bind(this);
        this.goToSlide = this.goToSlide.bind(this);
        this.upcomingFestivalsRef = createRef();
    }

    loadLoginStatusAndRecommendations = () => {
        const savedLogin = localStorage.getItem("isLoggedIn") === "true";
        const savedUserName = savedLogin ? (localStorage.getItem("userName") || "") : "";
        const savedUserRegion = savedLogin ? (localStorage.getItem("userRegion") || "") : "";

        this.setState({
            isLoggedIn: savedLogin,
            userName: savedUserName,
            userRegion: savedUserRegion
        }, () => {
            this.fetchPopularPosts();

            if (this.state.isLoggedIn && this.state.userName) {
                this.fetchRecommendations();
                this.fetchRecommendedRegionsForUser();
            } else {
                this.setState({ recommendations: [], recError: null, loadingRecs: false });
                this.loadOrSetAnonymousRegions();
            }
        });
    }

    componentDidMount() {
        this.loadLoginStatusAndRecommendations();
        this.fetchAndSetUpcomingFestivals();
        this.fetchCommunityHighlights(); // <-- 이 줄을 추가해주세요!
        this.fetchHottestTips();

        if (this.slides.length > 1) {
            this.slideInterval = setInterval(this.nextSlide, 7000);
        }
        window.addEventListener('storage', this.handleStorageChangeForHome);
    }

    componentWillUnmount() {
        if (this.slideInterval) clearInterval(this.slideInterval);
        window.removeEventListener('storage', this.handleStorageChangeForHome);
    }

    // ▼▼▼▼▼ [수정] 커뮤니티 하이라이트 데이터를 가져오는 함수 추가 ▼▼▼▼▼
    fetchCommunityHighlights = async () => {
        this.setState({ loadingHighlights: true, highlightsError: null });
        try {
            const response = await axios.get(`${API_BASE_URL}/api/posts/home_highlights`);
            this.setState({ communityHighlights: response.data.highlights || [], loadingHighlights: false });
        } catch (error) {
            console.error("커뮤니티 하이라이트 로딩 실패:", error);
            this.setState({
                highlightsError: "생생한 축제 이야기를 불러오는 데 실패했습니다.",
                loadingHighlights: false
            });
        }
    }
    // ▲▲▲

    // ▼▼▼▼▼ [수정] 인기 꿀팁 데이터를 가져오는 함수 추가 ▼▼▼▼▼
    fetchHottestTips = async () => {
        this.setState({ loadingTips: true, tipsError: null });
        try {
            const response = await axios.get(`${API_BASE_URL}/api/posts/hottest_tips`);
            this.setState({ hottestTips: response.data.hottestTips || [], loadingTips: false });
        } catch (error) {
            console.error("인기 꿀팁 로딩 실패:", error);
            this.setState({
                tipsError: "여행 꿀팁을 불러오는 데 실패했습니다.",
                loadingTips: false
            });
        }
    }
    // ▲▲▲▲▲ [수정] 여기까지 ▲▲▲▲▲

    handleStorageChangeForHome = (event) => {
        if (event.key === 'isLoggedIn' || event.key === 'userName' || event.key === 'userRegion') {
            this.loadLoginStatusAndRecommendations();
        }
    };

    fetchPopularPosts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/posts/popular?limit=4`);
            this.setState({ popularPosts: response.data.popularPosts || [] });
        } catch (error) {
            console.error("인기 게시글 불러오기 실패:", error);
            this.setState({ popularPosts: [] });
        }
    };


    fetchRecommendations = () => {
        const { userName } = this.state;
        const { t } = this.props;
        if (!userName) return;
        this.setState({ loadingRecs: true, recError: null });
        axios
            .post(`${API_BASE_URL}/recommend`, { userId: userName })
            .then((res) => {
                this.setState({
                    recommendations: res.data.recommendations || [],
                    loadingRecs: false,
                    recError: (!res.data.recommendations || res.data.recommendations.length === 0) ? t('home_no_recommendations') : null,
                });
            })
            .catch((err) => {
                this.setState({
                    recError: t('error_searching'),
                    loadingRecs: false,
                    recommendations: [],
                });
            });
    };

    fetchRecommendedRegionsForUser = async () => {
        const { t } = this.props;
        this.setState({ loadingRegions: true, regionsError: null });
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn("추천 지역 API 호출: 토큰 없음. 로그인 필요.");
                this.setState({ loadingRegions: false });
                this.loadOrSetAnonymousRegions();
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/api/recommend/regions`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.recommendedRegions && response.data.recommendedRegions.length > 0) {
                const finalRegions = response.data.recommendedRegions.map(recRegion => {
                    const fullRegionInfo = allAvailableRegions.find(ar => ar.name === recRegion.name);
                    return {
                        name: recRegion.name,
                        description: fullRegionInfo ? fullRegionInfo.description : t('no_region_description'),
                        image: fullRegionInfo ? fullRegionInfo.image : `${process.env.PUBLIC_URL}/images/placeholder.png`,
                    };
                });
                this.setState({ displayedRegions: finalRegions });
            } else {
                this.setState({ regionsError: t('no_recommended_regions'), displayedRegions: [] });
                this.loadOrSetAnonymousRegions();
            }
        } catch (error) {
            console.error("관심사 기반 추천 지역 불러오기 실패:", error.response?.data?.error || error.message);
            this.setState({
                regionsError: t('error_fetching_regions'),
                displayedRegions: []
            });
            this.loadOrSetAnonymousRegions();
        } finally {
            this.setState({ loadingRegions: false });
        }
    };

    loadOrSetAnonymousRegions = () => {
        const { t } = this.props;
        this.setState({ loadingRegions: true, regionsError: null });
        try {
            const sessionKey = 'anonymousRecommendedRegions';
            let storedRegions = sessionStorage.getItem(sessionKey);

            if (storedRegions) {
                const parsedRegions = JSON.parse(storedRegions);
                if (parsedRegions.length > 0) {
                    this.setState({ displayedRegions: parsedRegions });
                    this.setState({ loadingRegions: false });
                    return;
                }
            }

            const shuffled = [...allAvailableRegions].sort(() => 0.5 - Math.random());
            const newRandomRegions = shuffled.slice(0, 4).map(region => ({
                name: region.name,
                description: region.description,
                image: `${process.env.PUBLIC_URL}/images/placeholder.png`
            }));

            sessionStorage.setItem(sessionKey, JSON.stringify(newRandomRegions));
            this.setState({ displayedRegions: newRandomRegions, loadingRegions: false });

        } catch (e) {
            console.error("비로그인 지역 추천 로드/설정 중 오류:", e);
            this.setState({ regionsError: t('error_fetching_regions'), loadingRegions: false });
        }
    };


    fetchAndSetUpcomingFestivals = () => {
        const { t } = this.props;
        this.setState({ loadingUpcoming: true, upcomingError: null });

        axios.get(`${API_BASE_URL}/api/festivals`)
            .then(res => {
                const festivalsFromApi = res.data.festivals || [];
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);

                const processedFestivals = festivalsFromApi
                    .map(f => ({
                        ...f,
                        parsedStartDate: parseApiDate(f.startDate)
                    }))
                    .filter(f => f.parsedStartDate && f.parsedStartDate >= currentDate)
                    .sort((a, b) => a.parsedStartDate - b.parsedStartDate)
                    .slice(0, 10)
                    .map(f => {
                        const startDateDisplay = formatDateToDots(f.startDate);
                        const endDateDisplay = formatDateToDots(f.endDate);
                        const dateOutput = endDateDisplay && endDateDisplay !== startDateDisplay ? `${startDateDisplay} - ${endDateDisplay}` : startDateDisplay;

                        return {
                            id: f.resource,
                            name: f.name,
                            date: dateOutput,
                            image: f.images?.[0],
                            locationText: f.address ? f.address.split(' ')[0] : t('location_various'),
                        };
                    });

                this.setState({
                    upcomingFestivals: processedFestivals,
                    loadingUpcoming: false,
                    upcomingError: processedFestivals.length === 0 ? t('home_no_upcoming_festivals_data') : null
                });
            })
            .catch(err => {
                console.error("다가오는 축제 정보 로드 실패:", err);
                this.setState({
                    loadingUpcoming: false,
                    upcomingFestivals: [],
                    upcomingError: t('error_fetching_data')
                });
            });
    }

    handleUpcomingScroll = (direction) => {
        const container = this.upcomingFestivalsRef.current;
        if (container) {
            const scrollAmount = 355;
            if (direction === 'prev') {
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    handleJobInfoClick = () => {
        const { t } = this.props;
        if (this.state.isLoggedIn) {
            alert(t('home_job_info_redirect_alert'));
        } else {
            alert(t('login_required_alert'));
        }
    };

    nextSlide = () => {
        this.setState(prev => ({
            currentSlide: (prev.currentSlide + 1) % this.slides.length,
        }));
    };

    prevSlide = () => {
        this.setState(prev => ({
            currentSlide: (prev.currentSlide - 1 + this.slides.length) % this.slides.length,
        }));
    };

    goToSlide = (index) => {
        this.setState({ currentSlide: index });
    };

    render() {
        const { t } = this.props;
        const {
            isLoggedIn, recommendations, loadingRecs, recError, currentSlide,
            upcomingFestivals, loadingUpcoming, upcomingError,
            userName, userRegion,
            displayedRegions, loadingRegions, regionsError,
            communityHighlights, loadingHighlights, highlightsError,
            hottestTips, loadingTips, tipsError
        } = this.state;

        console.log("현재 userRegion:", userRegion);
        console.log("sb2 배너 링크:", isLoggedIn && userRegion ? `/region/${userRegion}` : '/info/safety_guide');

        const currentSlideData = this.slides.length > 0 ? this.slides[currentSlide] : null;

        return (
            <div className="home-page-container vibrant-theme">
                {currentSlideData && (
                    <section
                        className="hero-slider-section vibrant-hero"
                        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}${currentSlideData.image})` }}
                        aria-roledescription="carousel"
                        aria-label={t(currentSlideData.title_key)}
                    >
                        <div className="hero-slide-overlay vibrant-overlay">
                            <div className="hero-slide-content">
                                <div className="hero-text-block animated-text">
                                    <p className="hero-slide-kicker"><FaTicketAlt /> {t('home_hero_kicker_vibrant')}</p>
                                    <h1 className="hero-slide-title">{t(currentSlideData.title_key)}</h1>
                                    <p className="hero-slide-desc">{t(currentSlideData.desc_key)}</p>
                                    <Link to={`/banner-theme/${currentSlideData.themeServerKey}`} className="hero-slide-button vibrant-button">
                                        {t(currentSlideData.buttonText_key)} <FaChevronRight className="button-icon" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        {this.slides.length > 1 && (
                            <>
                                <button onClick={this.prevSlide} className="slide-control prev" aria-label={t('previous_slide')}><FaChevronLeft /></button>
                                <button onClick={this.nextSlide} className="slide-control next" aria-label={t('next_slide')}><FaChevronRight /></button>
                                <div className="slide-indicators">
                                    {this.slides.map((_, index) => (
                                        <button key={index} className={`indicator ${index === currentSlide ? 'active' : ''}`} onClick={() => this.goToSlide(index)} aria-label={`Go to slide ${index + 1}`} />
                                    ))}
                                </div>
                            </>
                        )}
                    </section>
                )}

                <div className="section-divider-top">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120"><path fill="#f9f9f9" fillOpacity="1" d="M0,96L120,80C240,64,480,32,720,32C960,32,1200,64,1320,80L1440,96L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path></svg>
                </div>

                <section className="home-section curation-section">
                    <h2 className="home-section-title">{t('home_curation_section_title')}</h2>
                    <div className="curation-grid">
                        {curationTabsData.map(tab => (
                            <Link to={tab.link} key={tab.id} className="curation-card">
                                <div className="curation-card-icon">{tab.icon}</div>
                                <h3 className="curation-card-title">{t(tab.titleKey)}</h3>
                                <p className="curation-card-desc">{t(tab.descriptionKey)}</p>
                                <span className="curation-card-cta">{t(tab.ctaKey, t('view_more'))} <FaChevronRight /></span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="home-section upcoming-festivals-highlight-section">
                    <h2 className="home-section-title"><FaRegCalendarAlt /> {t('home_upcoming_festivals_title')}</h2>
                    {loadingUpcoming ? (
                        <p className="loading-message">{t('festivals_loading')}</p>
                    ) : upcomingError ? (
                        <p className="error-message">{upcomingError}</p>
                    ) : upcomingFestivals.length > 0 ? (
                        <div className="upcoming-slider-container">
                            {upcomingFestivals.length > 3 && (
                                <button
                                    onClick={() => this.handleUpcomingScroll('prev')}
                                    className="upcoming-slide-control prev"
                                    aria-label={t('previous_slide_upcoming')}
                                >
                                    <FaChevronLeft />
                                </button>
                            )}
                            <div className="upcoming-festivals-grid" ref={this.upcomingFestivalsRef}>
                                {upcomingFestivals.map(festival => (
                                    <div key={festival.id} className="upcoming-festival-card">
                                        <div className="upcoming-card-image-wrapper">
                                            <img
                                                src={festival.image || `${process.env.PUBLIC_URL}/images/placeholder.png`}
                                                alt={festival.name}
                                                className="upcoming-card-image"
                                                onError={(e) => { e.target.onerror = null; e.target.src = `${process.env.PUBLIC_URL}/images/placeholder.png`; }}
                                            />
                                        </div>
                                        <div className="upcoming-card-content">
                                            <h3 className="upcoming-card-name">{festival.name}</h3>
                                            {festival.locationText && <p className="upcoming-card-location"><FaMapMarkedAlt size={12} /> {festival.locationText}</p>}
                                            <p className="upcoming-card-date">{festival.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {upcomingFestivals.length > 3 && (
                                <button
                                    onClick={() => this.handleUpcomingScroll('next')}
                                    className="upcoming-slide-control next"
                                    aria-label={t('next_slide_upcoming')}
                                >
                                    <FaChevronRight />
                                </button>
                            )}
                        </div>
                    ) : (
                        <p className="info-message">{t('home_no_upcoming_festivals_data')}</p>
                    )}
                    {!loadingUpcoming && !upcomingError && (
                        <div className="section-more-button-container">
                            <Link to="/festivals" className="section-more-button">{t('view_all_festivals_short')}</Link>
                        </div>
                    )}
                </section>

                <section className="home-section featured-regions-section">
                    <h2 className="home-section-title"><FaSearchLocation /> {t('home_featured_regions_title')}</h2>
                    {loadingRegions ? (
                        <p className="loading-message">{t('loading_regions')}</p>
                    ) : regionsError ? (
                        <p className="error-message">{regionsError}</p>
                    ) : (
                        <div className="featured-regions-grid">
                            {displayedRegions.length > 0 ? (
                                displayedRegions.map((region, index) => (
                                    <Link to={`/region/${encodeURIComponent(region.name)}`} key={region.name} className="featured-region-card">
                                        <img src={region.image || `${process.env.PUBLIC_URL}/images/placeholder.png`} alt={t(`region_name_${region.name.replace(/ /g, '_').toLowerCase()}`, region.name)} className="featured-region-image" />
                                        <div className="featured-region-overlay">
                                            <h3 className="featured-region-name">{t(`region_name_${region.name.replace(/ /g, '_').toLowerCase()}`, region.name)}</h3>
                                            <p className="featured-region-desc">{t(`region_desc_${region.name.replace(/ /g, '_').toLowerCase()}`, region.description)}</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="info-message">{t('no_regions_to_display', '표시할 추천 지역이 없습니다.')}</p>
                            )}
                        </div>
                    )}
                </section>

                {isLoggedIn && (
                    <section className="home-section recommended-festivals-section user-recommendations">
                        <h2 className="home-section-title"><FaRegStar /> {t('home_user_recommend_title', { userName: userName })}</h2>
                        {loadingRecs ? <p className="loading-message">{t('loading_results')}</p>
                            : recError ? <p className="error-message">{recError}</p>
                                : recommendations.length > 0 ? (
                                    <>
                                        <div className="home-card-list four-cards">
                                            {recommendations.slice(0, 8).map((festival, idx) => (
                                                <div className="home-festival-card" key={festival['축제일련번호'] || `${festival['축제명']}-${idx}-rec`}>
                                                    <Link to={`/festivals/detail/${festival['축제일련번호'] || festival['축제명']}`}>
                                                        <div className="home-card-image-wrapper">
                                                            <img
                                                                src={festival['대표이미지'] || `${process.env.PUBLIC_URL}/images/placeholder.png`}
                                                                alt={festival['축제명']}
                                                                className="home-card-image"
                                                                onError={(e) => { e.target.onerror = null; e.target.src = `${process.env.PUBLIC_URL}/images/placeholder.png`; }}
                                                            />
                                                        </div>
                                                    </Link>
                                                    <div className="home-card-body">
                                                        <h3 className="home-card-title">
                                                            <Link to={`/festivals/detail/${festival['축제일련번호'] || festival['축제명']}`}>{festival['축제명']}</Link>
                                                        </h3>
                                                        {festival['개최장소'] && (
                                                            <p className="home-card-location">
                                                                <FaMapMarkedAlt size={12} style={{ marginRight: '5px', opacity: 0.7 }} />
                                                                {festival['개최장소']}
                                                            </p>
                                                        )}
                                                        {(festival['축제시작일자'] || festival['축제종료일자']) && (
                                                            <p className="home-card-date">
                                                                <FaRegCalendarAlt size={12} style={{ marginRight: '5px', opacity: 0.7 }} />
                                                                {t('festivals_card_duration_simple', {
                                                                    startDate: formatDateToDots(festival['축제시작일자']),
                                                                    endDate: formatDateToDots(festival['축제종료일자'])
                                                                })}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {recommendations.length > 8 && (
                                            <div className="section-more-button-container">
                                                <Link to="/festivals?filter=recommended" className="section-more-button">{t('view_more_recommendations')}</Link>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="info-message">{t('home_no_recommendations_data')}</p>
                                )
                        }
                    </section>
                )}
                {!isLoggedIn && (
                    <section className="home-section login-cta-section">
                        <FaUsers className="login-cta-icon" />
                        <h2 className="home-section-title secondary">{t('home_login_cta_title')}</h2>
                        <p>{t('home_login_for_recommendations')}</p>
                        <Link to="/login" className="hero-slide-button vibrant-button">{t('login_button')}</Link>
                    </section>
                )}

                <section className="home-section travel-tips-section">
                    <h2 className="home-section-title"><FaInfoCircle /> {t('home_travel_tips_title')}</h2>
                    <div className="travel-tips-list">
                        {loadingTips ? (
                            <p className="loading-message">{t('loading_data', '데이터를 불러오는 중...')}</p>
                        ) : tipsError ? (
                            <p className="error-message">{tipsError}</p>
                        ) : hottestTips.length > 0 ? (
                            hottestTips.map(tip => (
                                <Link to={`/community/post/${tip.id}`} key={tip.id} className="travel-tip-item">
                                    <div className="tip-icon-wrapper"><FaPlaneDeparture size={24} /></div>
                                    <div className="tip-content">
                                        <h4 className="tip-title">{tip.title}</h4>
                                        <p className="tip-summary">{tip.content}</p>
                                    </div>
                                    <FaChevronRight className="tip-arrow" />
                                </Link>
                            ))
                        ) : (
                            <p className="info-message">{t('no_travel_tips_yet', '아직 등록된 꿀팁이 없습니다.')}</p>
                        )}
                    </div>
                </section>

                {serviceBannersData.length > 0 && (
                    <section className="home-section service-banner-section">
                        <h2 className="home-section-title"><FaLightbulb /> {t('home_partner_services_title')}</h2>
                        <div className="service-banner-grid">
                            {serviceBannersData.map(banner => {
                                // ▼▼▼▼▼ 링크를 동적으로 설정하는 로직 ▼▼▼▼▼
                                let finalLink = banner.link; // 1. 기본 링크로 시작합니다.

                                // "꿀팁" 배너 (id: 'sb1')의 링크를 '/community/tips'로 변경
                                if (banner.id === 'sb1') {
                                    finalLink = '/community/tips';
                                }

                                // "우리 지역" 배너 (id: 'sb2')의 링크를 조건부로 변경
                                if (banner.id === 'sb2') {
                                    if (isLoggedIn && userRegion) {
                                        finalLink = `/region/${encodeURIComponent(userRegion)}`;
                                    } else {
                                        finalLink = '/regions';
                                    }
                                }
                                // ▲▲▲▲▲ 로직 끝 ▲▲▲▲▲

                                // 4. 최종 결정된 링크(finalLink)를 사용합니다.
                                return (
                                    <Link to={finalLink} key={banner.id} className="service-banner-item" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}${banner.image})` }}>
                                        <div className="service-banner-overlay">
                                            <h3 className="service-banner-title">{t(banner.titleKey)}</h3>
                                            <p className="service-banner-desc">{t(banner.descriptionKey)}</p>
                                            <span className="service-banner-cta">{t('learn_more')} <FaChevronRight /></span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                <section className="home-section community-highlights-section">
                    <h2 className="home-section-title"><FaComments />{t('home_community_highlights_title')}</h2>
                    {loadingHighlights ? (
                        <p className="loading-message">{t('loading_data', '데이터를 불러오는 중...')}</p>
                    ) : highlightsError ? (
                        <p className="error-message">{highlightsError}</p>
                    ) : communityHighlights.length > 0 ? (
                        <div className="community-highlights-grid">
                            {communityHighlights.map(highlight => (
                                <Link to={`/community/post/${highlight.id}`} key={highlight.id} className="community-highlight-card">
                                    <div className="community-card-image-wrapper">
                                        <img src={highlight.imageUrl || `${process.env.PUBLIC_URL}/images/placeholder.png`}
                                            alt={highlight.title}
                                            className="community-card-image"
                                            onError={(e) => { e.target.onerror = null; e.target.src = `${process.env.PUBLIC_URL}/images/placeholder.png`; }}
                                        />
                                    </div>
                                    <div className="community-card-content">
                                        <span className={`highlight-type-badge type-community_type_${highlight.category.toLowerCase()}`}>
                                            {t(`community_category_${highlight.category.toLowerCase()}`, highlight.category)}
                                        </span>
                                        <h4 className="highlight-title-card">{highlight.title}</h4>
                                        <div className="highlight-meta">
                                            <span className="highlight-author-card">{t('by_author', { author: highlight.author === 'admin' ? '운영팀' : highlight.author })}</span>
                                            <span className="highlight-likes-card"><FaRegStar style={{ marginRight: '4px' }} /> {highlight.likes}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="info-message">{t('no_highlights_yet', '아직 추천할 만한 이야기가 없어요.')}</p>
                    )}
                    <div className="section-more-button-container">
                        <Link to="/community" className="section-more-button">{t('view_more_community')}</Link>
                    </div>
                </section>

                <section className="home-section job-info-section vibrant-bg">
                    <div className="job-info-content">
                        <FaHandsHelping className="job-info-icon" />
                        <h2 className="home-section-title secondary inverted">{t('home_job_title')}</h2>
                        <p className="inverted-text">{t('home_job_desc1')}</p>
                        <p className="inverted-text">{t('home_job_desc2')}</p>
                        <Link to="/apply" className="hero-slide-button alt-button">
                        {t('home_job_button')} <FaMapMarkedAlt style={{ marginLeft: '8px' }} />
                        </Link>
                    </div>
                </section>

                <footer className="home-footer">
                    <div className="footer-content-wrapper">
                        <div className="footer-top-row">
                            <div className="footer-links">
                                <Link to="/about">{t('footer_about_us')}</Link>
                                <Link to="/terms">{t('footer_terms')}</Link>
                                <Link to="/privacy">{t('footer_privacy')}</Link>
                                <Link to="/contact">{t('footer_contact_us')}</Link>
                            </div>
                        </div>
                        <div className="footer-main-content">
                            <div className="footer-info">
                                <h3 className="footer-appname">{t('appName')}</h3>
                                <p>{t('footer_address')}</p>
                                <p>{t('footer_tel')} | {t('footer_email')}</p>
                                <p>{t('footer_biz_info')} | {t('footer_tourism_biz_info')}</p>
                            </div>
                            <div className="footer-link-group">
                                <h4>{t('footer_navigation_title')}</h4>
                                <Link to="/festivals">{t('nav_all_festivals')}</Link>
                                <Link to="/regions">{t('nav_regions')}</Link>
                                <Link to="/themes">{t('nav_themes')}</Link>
                                <Link to="/map">{t('nav_map')}</Link>
                            </div>
                            <div className="footer-social-and-partners">
                                <h4>{t('footer_social_title')}</h4>
                                <div className="footer-social-icons">
                                    <a href="#!" aria-label="Facebook" title="Facebook"><img src={`${process.env.PUBLIC_URL}/images/sns/facebook_icon.svg`} alt="Facebook" /></a>
                                    <a href="#!" aria-label="Instagram" title="Instagram"><img src={`${process.env.PUBLIC_URL}/images/sns/instagram_icon.svg`} alt="Instagram" /></a>
                                    <a href="#!" aria-label="Youtube" title="Youtube"><img src={`${process.env.PUBLIC_URL}/images/sns/youtube_icon.svg`} alt="Youtube" /></a>
                                    <a href="#!" aria-label="Blog" title="Blog"><img src={`${process.env.PUBLIC_URL}/images/sns/blog_icon.svg`} alt="Blog" /></a>
                                </div>
                            </div>
                        </div>
                        <div className="footer-copyright">
                            <p>&copy; {new Date().getFullYear()} {t('appName')}. {t('footer_rights_reserved')}</p>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }
}

export default withTranslation()(Home);
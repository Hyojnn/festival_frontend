// frontend/src/components/Theme.jsx
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import "../theme.css";
import '../festival.css';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // 훅 사용
const API_BASE_URL = process.env.REACT_APP_API_URL;

// 테마 데이터는 컴포넌트 외부 또는 설정 파일에서 관리하고, 여기서는 키만 참조하는 것이 좋습니다.
// 번역을 위해 title과 desc는 키로 관리합니다.
const themesRawData = [
    { titleKey: "theme_night_title", image: "/images/theme/theme1.jpg", serverKey: "야간관광", descKey: "theme_night_desc" },
    { titleKey: "theme_guide_title", image: "/images/theme/theme2.jpg", serverKey: "문화관광해설사 통합예약", descKey: "theme_guide_desc" },
    { titleKey: "theme_star_title", image: "/images/theme/theme3.jpg", descKey: "theme_star_desc", serverKey: "한국관광의별" },
    { titleKey: "theme_smart_title", image: "/images/theme/theme4.jpg", descKey: "theme_smart_desc", serverKey: "스마트관광도시" },
    { titleKey: "theme_durunubi_title", image: "/images/theme/theme5.jpg", serverKey: "두루누비", descKey: "theme_durunubi_desc" },
    { titleKey: "theme_digital_id_title", image: "/images/theme/theme6.jpg", serverKey: "디지털 관광주민증", descKey: "theme_digital_id_desc" },
];

const Theme = ({ toggleSearchOverlay }) => {
    const { t } = useTranslation();

    const themesData = useMemo(() => themesRawData.map(theme => ({
        ...theme,
        title: t(theme.titleKey, theme.titleKey.replace('theme_', '').replace('_title', '')),
        desc: theme.descKey ? t(theme.descKey) : undefined
    })), [t]); // themesRawData 의존성 제거 (ESLint 경고에 따라)

    const [currentSlideIndex, setCurrentSlideIndex] = useState(themesData.length > 0 ? 1 : 0);
    const [isAnimating, setIsAnimating] = useState(false);
    const sliderRef = useRef(null);

    const [selectedServerThemeKey, setSelectedServerThemeKey] = useState('');
    const [displayedThemeName, setDisplayedThemeName] = useState('');
    const [themeFestivals, setThemeFestivals] = useState([]);
    const [loadingFestivals, setLoadingFestivals] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const extendedThemes = useMemo(() =>
        themesData.length > 0 ? [themesData[themesData.length - 1], ...themesData, themesData[0]] : [],
        [themesData]);

    const cardWidth = 320;

    const goToSlide = useCallback((index, animate = true) => {
        if (!sliderRef.current || themesData.length === 0) return;
        setIsAnimating(animate);
        setCurrentSlideIndex(index);
        sliderRef.current.style.transition = animate ? "transform 0.5s ease" : "none";
        sliderRef.current.style.transform = `translateX(-${index * cardWidth}px)`;
    }, [themesData, cardWidth]);

    const handleTransitionEnd = useCallback(() => {
        setIsAnimating(false);
        if (!sliderRef.current || themesData.length === 0) return;
        if (currentSlideIndex === 0) {
            goToSlide(themesData.length, false);
        } else if (currentSlideIndex === themesData.length + 1) {
            goToSlide(1, false);
        }
    }, [currentSlideIndex, themesData, goToSlide]);

    const handlePrev = useCallback(() => {
        if (!isAnimating && themesData.length > 0) goToSlide(currentSlideIndex - 1);
    }, [isAnimating, themesData, currentSlideIndex, goToSlide]);

    const handleNext = useCallback(() => {
        if (!isAnimating && themesData.length > 0) goToSlide(currentSlideIndex + 1);
    }, [isAnimating, themesData, currentSlideIndex, goToSlide]);

    const startX = useRef(0);
    const isDragging = useRef(false);
    const currentTransformRef = useRef(0);

    const handleMouseDown = useCallback((e) => {
        if (themesData.length === 0 || !sliderRef.current) return;
        isDragging.current = true;
        startX.current = e.nativeEvent.pageX || (e.nativeEvent.touches && e.nativeEvent.touches[0].pageX);
        sliderRef.current.style.transition = "none";
        const style = window.getComputedStyle(sliderRef.current);
        const matrix = new DOMMatrixReadOnly(style.transform);
        currentTransformRef.current = matrix.m41;
    }, [themesData]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging.current || !sliderRef.current || themesData.length === 0) return;
        const currentX = e.nativeEvent.pageX || (e.nativeEvent.touches && e.nativeEvent.touches[0].pageX);
        if (currentX === undefined) return;
        const deltaX = currentX - startX.current;
        sliderRef.current.style.transform = `translateX(${currentTransformRef.current + deltaX}px)`;
    }, [themesData]);

    const handleMouseUp = useCallback((e) => {
        if (!isDragging.current || !sliderRef.current || themesData.length === 0) return;
        isDragging.current = false;
        const endX = e.pageX || (e.changedTouches && e.changedTouches[0].pageX);

        let deltaX = 0;
        if (endX !== undefined) {
            deltaX = endX - startX.current;
        }
        sliderRef.current.style.transition = "transform 0.5s ease";
        if (Math.abs(deltaX) > 50) {
            if (deltaX > 0) handlePrev();
            else handleNext();
        } else {
            sliderRef.current.style.transform = `translateX(-${currentSlideIndex * cardWidth}px)`;
        }
    }, [themesData, currentSlideIndex, cardWidth, handlePrev, handleNext]);

    useEffect(() => {
        if (sliderRef.current && themesData.length > 0) {
            goToSlide(1, false);
        }
    }, [themesData, goToSlide]);

    const fetchFestivalsByThemeAPI = useCallback(async (themeServerKey) => {
        if (!themeServerKey) return;
        setLoadingFestivals(true);
        setFetchError(null);
        setThemeFestivals([]);
        const currentDisplayedThemeName = displayedThemeName || t(themesData.find(th => th.serverKey === themeServerKey)?.titleKey || '', themeServerKey);

        try {
            const response = await axios.get(`${API_BASE_URL}/api/festivals?theme=${encodeURIComponent(themeServerKey)}`);
            setThemeFestivals(response.data.festivals || []);
            if (!response.data.festivals || response.data.festivals.length === 0) {
                setFetchError(t('theme_select_error_no_festivals', { themeName: currentDisplayedThemeName }));
            }
        } catch (err) {
            console.error("Theme.jsx: API Error fetching festivals for theme", themeServerKey, err);
            let errMsg = t('theme_select_loading_error', { themeName: currentDisplayedThemeName });
            if (err.response && err.response.data) {
                errMsg = err.response.data.error || err.response.data.message || errMsg;
            } else if (err.request) {
                errMsg = t('error_server_no_response');
            }
            setFetchError(errMsg);
            setThemeFestivals([]);
        } finally {
            setLoadingFestivals(false);
        }
    }, [displayedThemeName, t, themesData]);

    useEffect(() => {
        if (selectedServerThemeKey) {
            fetchFestivalsByThemeAPI(selectedServerThemeKey);
        } else {
            setThemeFestivals([]);
            setFetchError(null);
            setDisplayedThemeName('');
        }
    }, [selectedServerThemeKey, fetchFestivalsByThemeAPI]);

    const handleThemeCardClick = (themeItem) => {
        if (themeItem && themeItem.serverKey) {
            if (selectedServerThemeKey !== themeItem.serverKey) {
                setSelectedServerThemeKey(themeItem.serverKey);
                setDisplayedThemeName(themeItem.title);
            }
        } else {
            console.warn("Theme.jsx: Clicked theme item is invalid or has no serverKey.", themeItem);
        }
    };

    return (
        <div className="theme-page">

            <div className="theme-banner">
                <p className="theme-banner-title">
                    {t('theme_banner_title_normal')} <br />
                    <strong>{t('theme_banner_title_strong')}</strong>
                </p>
            </div>

            {themesData.length > 0 ? (
                <>
                    <div className="theme-slider-wrapper">
                        <div
                            className="theme-slider-track"
                            ref={sliderRef}
                            onTransitionEnd={handleTransitionEnd}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleMouseDown}
                            onTouchMove={handleMouseMove}
                            onTouchEnd={handleMouseUp}
                            style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
                        >
                            {extendedThemes.map((themeItem, idx) => (
                                <div
                                    className="theme-card"
                                    key={`extended-${themeItem.serverKey || themeItem.titleKey}-${idx}`} // serverKey 우선 사용
                                    onClick={() => handleThemeCardClick(themeItem)}
                                    style={{ cursor: 'pointer' }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && handleThemeCardClick(themeItem)}
                                >
                                    <div className="theme-image" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}${themeItem.image || '/images/default-theme.jpg'})` }} />
                                    <div className="theme-label">{themeItem.title}</div>
                                    {themeItem.desc && <div className="theme-desc">{themeItem.desc}</div>}
                                </div>
                            ))}
                        </div>

                        <div className="theme-pagination">
                            <span className="current">
                                {String(currentSlideIndex === 0 ? themesData.length : currentSlideIndex === themesData.length + 1 ? 1 : currentSlideIndex).padStart(2, "0")}
                            </span>{" "}
                            / {String(themesData.length).padStart(2, "0")}
                            <button className="arrow left" onClick={handlePrev} aria-label={t('theme_arrow_prev_aria')}> {"<"} </button>
                            <button className="arrow right" onClick={handleNext} aria-label={t('theme_arrow_next_aria')}> {">"} </button>
                        </div>
                    </div>

                    {selectedServerThemeKey && displayedThemeName && (
                        <div className="selected-theme-festivals" style={{ marginTop: '40px', padding: '0 20px' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{t('theme_select_related_festivals_title', { themeName: displayedThemeName })}</h2>
                            {loadingFestivals && <p style={{ textAlign: 'center', fontSize: '1.2em' }}>{t('festivals_loading')}</p>}
                            {fetchError && (themeFestivals.length === 0) && <p style={{ color: 'red', textAlign: 'center', fontSize: '1.1em', fontWeight: 'normal', marginTop: '20px' }}>{fetchError}</p>}
                            {!loadingFestivals && !fetchError && themeFestivals.length === 0 && (
                                <p style={{ textAlign: 'center', fontSize: '1.1em', marginTop: '20px' }}>{t('theme_select_error_no_festivals', { themeName: displayedThemeName })}</p>
                            )}
                            {!loadingFestivals && themeFestivals.length > 0 && (
                                <div className="festival-list"> {/* festival.css의 스타일 재활용 */}
                                    {themeFestivals.map((f, i) => (
                                        <div className="festival-card" key={f.resource || `${f.name}-${i}-theme`}>
                                            <img
                                                src={f.images?.[0] || `${process.env.PUBLIC_URL}/images/placeholder.png`}
                                                alt={f.name || t('festival_image_alt', '축제 이미지')}
                                                className="festival-card-image" // 이 클래스에 높이/너비 등 스타일 지정 필요
                                                onError={(e) => { e.target.onerror = null; e.target.src = `${process.env.PUBLIC_URL}/images/placeholder.png`; }}
                                            />
                                            <div className="festival-info">
                                                <h3>{f.name}</h3>
                                                {f.description && <p className="description">{f.description.slice(0, 100)}{f.description.length > 100 ? '...' : ''}</p>}
                                                <ul>
                                                    <li>{t('festivals_card_duration', { startDate: f.startDate, endDate: f.endDate })}</li>
                                                    <li>{t('festivals_card_location', { location: f.address || t('no_location_info') })}</li>
                                                    {/* 홈페이지 주소는 현재 API에서 제공되지 않음 */}
                                                    {/* {f.homepage && <li><a href={f.homepage} target="_blank" rel="noopener noreferrer">🔗 {t('festivals_card_homepage')}</a></li>} */}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <p style={{ textAlign: 'center', marginTop: '20px' }}>{t('theme_select_no_theme_display')}</p>
            )}
        </div>
    );
};

export default Theme;
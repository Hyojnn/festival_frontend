// frontend/src/components/BannerThemeFestivalsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../festival.css'; // 축제 카드 스타일 재활용
const API_BASE_URL = process.env.REACT_APP_API_URL;

// 각 테마 키에 따른 배경 이미지 URL 매핑 (예시)
const themeBackgrounds = {
    default: '/images/regions/default-region.jpg', // 기본 배경
    winter_snow: '/images/slide1.jpg', // '겨울 눈꽃' 테마 배경 예시
    summer_music: '/images/slide2.jpg', // '여름 음악' 테마 배경 예시
    traditional_culture: '/images/slide3.jpg', // (예시) 전통 문화 테마 배경
    food_festival: '/images/slide4.jpg' // (예시) 음식 축제 테마 배경
    // home.jsx의 슬라이드 이미지와 일치시키거나, 각 테마에 맞는 별도 이미지 지정
};

const BannerThemeFestivalsPage = () => {
    const { t } = useTranslation();
    const { themeKey } = useParams();

    const [festivals, setFestivals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [themeName, setThemeName] = useState('');

    const currentBackground = themeBackgrounds[themeKey] || themeBackgrounds.default;

    useEffect(() => {
        if (themeKey) {
            const titleKey = `banner_theme_${themeKey}_title`;
            const translatedThemeName = t(titleKey, { defaultValue: t('banner_theme_default_title', { themeKey: themeKey }) });
            setThemeName(translatedThemeName);
        }
    }, [themeKey, t]);

    const fetchFestivalsByTheme = useCallback(async () => {
        if (!themeKey) {
            setError(t('banner_theme_page_no_theme_key'));
            setFestivals([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/festivals?theme=${encodeURIComponent(themeKey)}`);
            setFestivals(response.data.festivals || []);
        } catch (err) {
            console.error("BannerThemeFestivalsPage: Error fetching festivals by theme", err);
            let errMsg = t('banner_theme_page_error_loading', { theme: themeName || themeKey });
            if (err.response && err.response.data && (err.response.data.error || err.response.data.message)) {
                errMsg = err.response.data.error || err.response.data.message;
            }
            setError(errMsg);
            setFestivals([]);
        } finally {
            setLoading(false);
        }
    }, [themeKey, t, themeName]);

    useEffect(() => {
        fetchFestivalsByTheme();
    }, [fetchFestivalsByTheme]);

    return (
        <div className="banner-theme-festivals-page">
            <header
                className="themed-hero-section"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${process.env.PUBLIC_URL}${currentBackground})`,
                    height: '350px',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'white',
                    marginBottom: '30px',
                }}
            >
                <h1>{themeName || t('loading_results', '로딩 중...')}</h1>
            </header>

            <main style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>
                {loading && <p style={{ textAlign: 'center', fontSize: '1.2em' }}>{t('festivals_loading')}</p>}
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                {!loading && !error && festivals.length === 0 && (
                    <p style={{ textAlign: 'center', fontSize: '1.1em', marginTop: '20px' }}>
                        {t('banner_theme_page_no_festivals', { theme: themeName || themeKey })}
                    </p>
                )}

                {!loading && !error && festivals.length > 0 && (
                    <div className="festival-list"> {/* festival.css의 스타일 재활용 */}
                        {festivals.map((f, i) => (
                            // resource 필드가 있다면 그것을 key로 사용하는 것이 더 좋습니다.
                            <div className="festival-card" key={f.resource || `${f.name}-${i}-banner-theme`}>
                                <img
                                    src={f.images?.[0] || `${process.env.PUBLIC_URL}/images/placeholder.png`}
                                    alt={f.name || t('festival_image_alt', '축제 이미지')}
                                    className="festival-card-image"
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
            </main>
        </div>
    );
};

export default BannerThemeFestivalsPage;
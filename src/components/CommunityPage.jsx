// frontend/src/components/CommunityPage.jsx

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { FaRegStar, FaInfoCircle, FaPlaneDeparture, FaPhotoVideo, FaVolumeUp, FaChevronRight, FaUserCircle, FaCalendarAlt, FaFire } from 'react-icons/fa';
import axios from 'axios';
import '../communityPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const staticTravelTips = [
    { id: 'tip1', titleKey: 'travel_tip_1_title', summaryKey: 'travel_tip_1_summary', icon: <FaInfoCircle size={24} />, link: '/info/travel_tips' },
    { id: 'tip2', titleKey: 'travel_tip_2_title', summaryKey: 'travel_tip_2_summary', icon: <FaPlaneDeparture size={24} />, link: '/info/safety_guide' },
    { id: 'tip3', titleKey: 'travel_tip_3_title', summaryKey: 'travel_tip_3_summary', icon: <FaPhotoVideo size={24} />, link: '/info/travel_tips' }
];

const staticNotices = [
    {
        id: 'notice_volunteer_staff',
        titleKey: 'home_service_banner_1_title',
        descriptionKey: 'home_service_banner_1_desc',
        link: '/info/travel_tips',
        isImportant: true
    },
    { id: 'notice_server_check', titleKey: 'notice_title_2', descriptionKey: 'notice_desc_2', link: '/community/post/notice2' },
    { id: 'notice_privacy_policy', titleKey: 'notice_title_3', descriptionKey: 'notice_desc_3', link: '/community/post/notice3' },
    { id: 'notice_data_update', titleKey: 'notice_title_4', descriptionKey: 'notice_desc_4', link: '/community/post/notice4' },
    { id: 'notice_rules_change', titleKey: 'notice_title_5', descriptionKey: 'notice_desc_5', link: '/community/post/notice5' },
];


class CommunityPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            popularPosts: [],
            travelTips: [],
            notices: [],
            allPosts: [],
            loading: true,
            error: null,
        };
    }

    componentDidMount() {
        this.fetchAllCommunityData();
        // 좋아요 수 변동에 따라 실시간 반영될 수 있도록 주기적으로 데이터를 가져오는 로직 추가
        // 이 부분은 필요에 따라 WebSocket 등으로 더 효율적인 실시간 업데이트를 구현할 수도 있습니다.
        this.interval = setInterval(this.fetchAllCommunityData, 30000); // 30초마다 갱신
    }

    componentWillUnmount() {
        clearInterval(this.interval); // 컴포넌트 언마운트 시 인터벌 정리
    }

    fetchAllCommunityData = async () => {
        try {
            // ✨ 인기 게시글 데이터를 백엔드에서 불러오기 (limit 6으로 변경)
            const popularPostsResponse = await axios.get(`${API_BASE_URL}/api/posts/popular?limit=6`);
            const fetchedPopularPosts = popularPostsResponse.data.popularPosts || [];

            // 모든 게시글 데이터를 백엔드에서 불러오기 (최신 5개)
            // CommunityPage 에서는 전체 게시글을 페이지네이션 없이 5개만 보여주므로,
            // 별도의 limit 파라미터 없이 API를 호출하거나, limit=5를 명시할 수 있습니다.
            // 여기서는 `limit=5`를 명시하여 확실하게 5개만 가져오도록 합니다.
            const allPostsResponse = await axios.get(`${API_BASE_URL}/api/posts?limit=5`);
            const fetchedAllPosts = allPostsResponse.data.posts || [];

            this.setState({
                popularPosts: fetchedPopularPosts,
                travelTips: staticTravelTips,
                notices: staticNotices,
                allPosts: fetchedAllPosts,
                loading: false,
            });
        } catch (error) {
            console.error("Failed to load community data:", error);
            this.setState({
                error: "커뮤니티 데이터를 불러오는 데 실패했습니다.",
                loading: false,
            });
        }
    }

    render() {
        const { t } = this.props;
        const { popularPosts, travelTips, notices, allPosts, loading, error } = this.state;

        if (loading) {
            return <div className="community-page-container"><p>{t('loading_data', '데이터를 불러오는 중...')}</p></div>;
        }

        if (error) {
            return <div className="community-page-container"><p className="error-message">{error}</p></div>;
        }

        return (
            <div className="community-page-container vibrant-theme">
                <header className="community-header">
                    <h1>{t('community_page_title', '커뮤니티')}</h1>
                    <p>{t('community_page_description', '축제에 대한 다양한 이야기와 꿀팁을 나누세요!')}</p>
                    <div className="community-actions">
                        <Link to="/community/write" className="write-post-button">{t('community_write_post', '글쓰기')}</Link>
                    </div>
                </header>

                {/* 공지사항 섹션 */}
                <section className="community-section notice-section">
                    <h2 className="section-title"><FaVolumeUp className="section-icon" /> {t('community_section_notice_title', '공지사항')}</h2>
                    {notices.length > 0 ? (
                        <div className="notice-list-display">
                            {notices.slice(0, 3).map(notice => ( // CommunityPage에서는 3개만 표시
                                <Link to={notice.link} key={notice.id} className="notice-item">
                                    <span className={`notice-badge ${notice.isImportant ? 'notice_badge_important' : ''}`}>
                                        {notice.isImportant ? t('notice_badge_important', '중요') : t('notice_badge', '공지')}
                                    </span>
                                    <h3 className="notice-title">{t(notice.titleKey)}</h3>
                                    <p className="notice-description">{t(notice.descriptionKey)}</p>
                                    <FaChevronRight className="tip-arrow" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="info-message">{t('no_notices_yet', '아직 등록된 공지사항이 없습니다.')}</p>
                    )}

                    <div className="section-more-button-container">
                        <Link to="/community/notices" className="section-more-button">{t('view_all_notices', '모든 공지 보기')}</Link>
                    </div>
                </section>

                {/* 인기 게시글 (하이라이트) 섹션 - 백엔드 연동 및 6개 표시 */}
                <section className="community-section highlight-section">
                    <h2 className="section-title"><FaRegStar className="section-icon" /> {t('community_section_popular_title', '인기 게시글')}</h2>
                    {popularPosts.length > 0 ? (
                        <div className="highlight-grid">
                            {popularPosts.map(post => (
                                <Link to={`/community/post/${post.id}`} key={post.id} className="highlight-card">
                                    <div className="highlight-image-wrapper">
                                        <img
                                            src={post.imageUrl || `${process.env.PUBLIC_URL}/images/placeholder.png`}
                                            alt={post.title}
                                            className="highlight-image"
                                            onError={(e) => { e.target.onerror = null; e.target.src = `${process.env.PUBLIC_URL}/images/placeholder.png`; }}
                                        />
                                    </div>
                                    <div className="highlight-content">
                                        <span className={`highlight-type-badge type-community_type_${post.category.toLowerCase()}`}>
                                            {t(`community_category_${post.category.toLowerCase()}`, post.category)}
                                        </span>
                                        <h4 className="highlight-title-card">{post.title}</h4>
                                        <div className="highlight-meta">
                                            <span className="highlight-author-card">{t('by_author', { author: post.author })}</span>
                                            <span className="highlight-likes-card"><FaRegStar style={{ marginRight: '4px' }} /> {post.likes}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                            {t('no_popular_posts_yet', '아직 인기 게시글이 없습니다.')}
                        </p>
                    )}
                </section>

                {/* 여행 꿀팁 섹션 */}
                <section className="community-section travel-tips-section">
                    <h2 className="section-title"><FaInfoCircle className="section-icon" /> {t('community_section_tips_title', '여행 꿀팁')}</h2>
                    <div className="travel-tips-list">
                        {travelTips.map(tip => (
                            <Link to={tip.link} key={tip.id} className="travel-tip-item">
                                <div className="tip-icon-wrapper">{tip.icon}</div>
                                <div className="tip-content">
                                    <h4 className="tip-title">{t(tip.titleKey)}</h4>
                                    <p className="tip-summary">{t(tip.summaryKey)}</p>
                                </div>
                                <FaChevronRight className="tip-arrow" />
                            </Link>
                        ))}
                    </div>
                    <div className="section-more-button-container">
                        <Link to="/community/tips" className="section-more-button">{t('view_all_tips', '모든 꿀팁 보기')}</Link>
                    </div>
                </section>

                {/* 일반 게시판 목록 (백엔드 데이터 연동) */}
                <section className="community-section general-posts-section">
                    <h2 className="section-title">
                        <FaFire className="section-icon" /> {t('community_section_all_posts_title', '전체 게시글')}
                    </h2>
                    <div className="post-list">
                        {allPosts.length > 0 ? (
                            allPosts.map(post => (
                                <Link to={`/community/post/${post.id}`} key={post.id} className="post-item">
                                    <div className="post-meta">
                                        <span className="post-category">{t(`community_category_${post.category.toLowerCase()}`, post.category)}</span>
                                        <span className="post-author"><FaUserCircle size={12} /> {post.author}</span>
                                        <span className="post-date">
                                            <FaCalendarAlt size={12} /> {
                                                post.createdAt ? new Date(post.createdAt).toLocaleDateString('ko-KR', {
                                                    year: 'numeric', month: '2-digit', day: '2-digit'
                                                }).replace(/\. /g, '.').replace(/\.$/, '') : ''
                                            }
                                        </span>
                                    </div>
                                    <h3 className="post-title">{post.title}</h3>
                                    <p className="post-summary">{post.content}</p>
                                </Link>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                                {t('no_posts_yet', '아직 등록된 게시글이 없습니다.')}
                            </p>
                        )}
                    </div>
                    <div className="section-more-button-container">
                        <Link to="/community/posts" className="section-more-button">{t('view_all_posts', '모든 게시글 보기')}</Link>
                    </div>
                </section>
            </div>
        );
    }
}

export default withTranslation()(CommunityPage);
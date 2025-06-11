// frontend/src/components/CommunityPage.jsx

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { FaRegStar, FaInfoCircle, FaPlaneDeparture, FaPhotoVideo, FaVolumeUp, FaChevronRight, FaUserCircle, FaCalendarAlt, FaFire, FaHandsHelping } from 'react-icons/fa';
import axios from 'axios';
import '../communityPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ADMIN_USERNAME = 'admin';

// staticTravelTips 제거 (API에서 불러올 것)

class CommunityPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            popularPosts: [],
            popularTips: [], // 인기 꿀팁 상태 추가
            notices: [],
            allPosts: [],
            loading: true,
            error: null,
        };
    }

    componentDidMount() {
        this.fetchAllCommunityData();
        this.interval = setInterval(this.fetchAllCommunityData, 30000); // 30초마다 갱신
    }

    componentWillUnmount() {
        clearInterval(this.interval); // 컴포넌트 언마운트 시 인터벌 정리
    }

    fetchAllCommunityData = async () => {
        try {
            // 인기 게시글 데이터를 백엔드에서 불러오기 (공지글 제외됨 - server.js 수정 후)
            const popularPostsResponse = await axios.get(`${API_BASE_URL}/api/posts/popular?limit=6`);
            const fetchedPopularPosts = popularPostsResponse.data.popularPosts || [];

            // 공지사항 (Notice) 데이터를 백엔드에서 불러오기 (최신 3개, 특별 공지 제외)
            const noticesResponse = await axios.get(`${API_BASE_URL}/api/posts?category=공지&limit=3`);
            const fetchedNotices = noticesResponse.data.posts || [];
            const filteredFetchedNotices = fetchedNotices.filter(notice => notice.id !== 'special-job-notice');

            // 좋아요를 많이 받은 꿀팁 게시글 4개 가져오기
            const popularTipsResponse = await axios.get(`${API_BASE_URL}/api/posts/popular_tips?limit=4`); // 새로운 API 호출
            const fetchedPopularTips = popularTipsResponse.data.popularTips || [];


            // 모든 게시글 데이터를 백엔드에서 불러오기 (최신 5개)
            const allPostsResponse = await axios.get(`${API_BASE_URL}/api/posts?limit=5`);
            const fetchedAllPosts = allPostsResponse.data.posts || [];

            this.setState({
                popularPosts: fetchedPopularPosts,
                popularTips: fetchedPopularTips, // 인기 꿀팁 상태 업데이트
                notices: filteredFetchedNotices,
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
        const { popularPosts, popularTips, notices, allPosts, loading, error } = this.state; // popularTips 상태 추가

        if (loading) {
            return <div className="community-page-container"><p>{t('loading_data', '데이터를 불러오는 중...')}</p></div>;
        }

        if (error) {
            return <div className="community-page-container"><p className="error-message">{error}</p></div>;
        }

        // 하드코딩된 특별 공지사항 데이터
        const specialJobNotice = {
            id: 'special-job-notice',
            title: t('special_notice_job_title', '축제 일자리 기회!'),
            content: t('special_notice_job_desc', '축제 자원봉사 및 스태프 참여 기회를 놓치지 마세요!'),
            category: '공지',
            author: '운영팀',
            imageUrl: null,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            isImportant: true,
        };

        // 특별 공지사항을 포함한 최종 공지사항 목록 (최대 4개)
        const displayedNotices = [specialJobNotice, ...notices].slice(0, 4);

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
                    {displayedNotices.length > 0 ? (
                        <div className="notice-list-display">
                            {displayedNotices.map(notice => (
                                <Link to={`/community/post/${notice.id}`} key={notice.id} className="notice-item">
                                    {notice.id === 'special-job-notice' && <FaHandsHelping style={{ marginRight: '10px', color: '#28a745', flexShrink: 0, alignSelf: 'flex-start' }} />}
                                    <span className={`notice-badge ${notice.isImportant ? 'notice_badge_important' : ''}`}>
                                        {notice.isImportant ? t('notice_badge_important', '중요') : t('notice_badge', '공지')}
                                    </span>
                                    <h3 className="notice-title">{notice.title || t(notice.titleKey)}</h3>
                                    <p className="notice-description">{notice.content || t(notice.descriptionKey)}</p>
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

                {/* 인기 게시글 (하이라이트) 섹션 - 이제 공지글이 포함되지 않음 */}
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
                                            <span className="highlight-author-card">
                                                <FaUserCircle style={{ marginRight: '4px' }} size={12} />
                                                {post.author === ADMIN_USERNAME ? "운영팀" : post.author}
                                            </span>
                                            <span className="highlight-likes-card"><FaRegStar style={{ marginRight: '4px' }} /> {post.likes}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        // 인기 게시글이 없을 때 메시지 표시
                        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                            {t('no_popular_posts_yet', '아직 인기 게시글이 없습니다. 게시글을 작성하고 좋아요를 받아보세요!')}
                        </p>
                    )}
                </section>

                {/* 여행 꿀팁 섹션 - 좋아요 많이 받은 꿀팁 4개 표시 */}
                <section className="community-section travel-tips-section">
                    <h2 className="section-title"><FaInfoCircle className="section-icon" /> {t('community_section_tips_title', '여행 꿀팁')}</h2>
                    {popularTips.length > 0 ? (
                        <div className="travel-tips-list">
                            {popularTips.map(tip => (
                                <Link to={`/community/post/${tip.id}`} key={tip.id} className="travel-tip-item"> {/* 꿀팁 상세 페이지로 연결 */}
                                    <div className="tip-icon-wrapper">
                                        {/* 꿀팁 아이콘 (원래 staticTravelTips에서 가져오던 것을 재현) */}
                                        <FaInfoCircle size={24} />
                                    </div>
                                    <div className="tip-content">
                                        <h4 className="tip-title">{tip.title}</h4> {/* API 공지사항은 title 필드 */}
                                        <p className="tip-summary">{tip.content}</p> {/* API 공지사항은 content 필드 */}
                                    </div>
                                    <FaChevronRight className="tip-arrow" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="info-message">{t('no_travel_tips_yet', '아직 등록된 꿀팁이 없습니다.')}</p>
                    )}
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
                                        <span className="post-author"><FaUserCircle size={12} /> {post.author === ADMIN_USERNAME ? "운영팀" : post.author}</span>
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
// frontend/src/components/AllPostsListPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { FaArrowLeft, FaUserCircle, FaCalendarAlt, FaFire, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import '../communityPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ADMIN_USERNAME = 'admin';

function AllPostsListPage({ t }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(10);
    const [totalPosts, setTotalPosts] = useState(0);

    const fetchAllPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`${API_BASE_URL}/api/posts?page=${currentPage}&limit=${postsPerPage}`);

            const fetchedPosts = response.data.posts || [];
            const totalFetchedPosts = parseInt(response.data.totalPosts, 10);

            let finalPosts = fetchedPosts;

            // 첫 페이지일 때만 중요 공지를 맨 앞에 추가
            if (currentPage === 1) {
                const specialJobNotice = {
                    id: 'special-job-notice',
                    title: t('special_notice_job_title', '축제 일자리 기회!'),
                    content: t('special_notice_job_desc', '축제 자원봉사 및 스태프 참여 기회를 놓치지 마세요!'),
                    category: '공지',
                    author: '운영팀',
                    createdAt: new Date().toISOString(),
                    isImportant: true, // 중요 공지 플래그
                };
                // API 결과에서 중복될 수 있는 특별 공지를 제거하고, 맨 앞에 추가
                finalPosts = [specialJobNotice, ...fetchedPosts.filter(p => p.id !== 'special-job-notice')];
            }

            setPosts(finalPosts);
            setTotalPosts(totalFetchedPosts);

        } catch (err) {
            console.error("모든 게시글 불러오기 실패:", err.response ? err.response.data : err.message);
            setError(t('all_posts_load_fail', '모든 게시글을 불러오는 데 실패했습니다.'));
        } finally {
            setLoading(false);
        }
    }, [currentPage, postsPerPage, t]);


    useEffect(() => {
        fetchAllPosts();
    }, [fetchAllPosts]);

    const totalPages = Math.ceil(totalPosts / postsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPageNumbersToShow = 5;
        let startPage, endPage;

        if (totalPages <= maxPageNumbersToShow) {
            startPage = 1;
            endPage = totalPages;
        } else {
            startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
            endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);
            if (endPage - startPage + 1 < maxPageNumbersToShow) {
                startPage = Math.max(1, endPage - maxPageNumbersToShow + 1);
            }
        }
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };


    if (loading) return <div className="community-page-container"><p>{t('loading_data', '데이터를 불러오는 중...')}</p></div>;
    if (error) return <div className="community-page-container"><p className="error-message">{error}</p></div>;

    return (
        <div className="community-page-container vibrant-theme">
            <div className="post-detail-header">
                <Link to="/community" className="back-button">
                    <FaArrowLeft /> {t('back_to_community', '커뮤니티로 돌아가기')}
                </Link>
                <h1>{t('all_posts_title', '모든 게시글')}</h1>
            </div>

            <section className="community-section general-posts-section">
                <h2 className="section-title">
                    <FaFire className="section-icon" /> {t('all_posts_heading', '최신 게시글')}
                </h2>
                <div className="post-list">
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <Link to={`/community/post/${post.id}`} key={post.id} className="post-item">
                                <div className="post-meta">
                                    {post.isImportant ? (
                                        <span className="notice-badge notice_badge_important">{t('notice_badge_important', '중요')}</span>
                                    ) : (
                                        <span className="post-category">{t(`community_category_${post.category.toLowerCase()}`, post.category)}</span>
                                    )}
                                    <span className="post-author"><FaUserCircle size={12} /> {post.author === ADMIN_USERNAME ? "운영팀" : post.author}</span>
                                    <span className="post-date">
                                        <FaCalendarAlt size={12} /> {
                                            new Date(post.createdAt).toLocaleDateString('ko-KR', {
                                                year: 'numeric', month: '2-digit', day: '2-digit'
                                            }).replace(/\. /g, '.').replace(/\.$/, '')
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

                {totalPosts > 0 && (
                    <div className="pagination">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-button"><FaChevronLeft /></button>
                        {getPageNumbers().map(number => (
                            <button key={number} onClick={() => handlePageChange(number)} className={`pagination-button ${currentPage === number ? 'active' : ''}`}>{number}</button>
                        ))}
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-button"><FaChevronRight /></button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default withTranslation()(AllPostsListPage);
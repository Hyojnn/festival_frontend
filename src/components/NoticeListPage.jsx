// frontend/src/components/NoticeListPage.jsx

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { FaBullhorn, FaArrowLeft, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import '../communityPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class NoticeListPage extends Component {
    state = {
        allNotices: [], // API에서 불러온 모든 공지사항 (특별 공지 제외)
        displayNotices: [], // 현재 페이지에 표시될 공지사항 (API 공지)
        loading: true,
        error: null,
        currentPage: 1,
        noticesPerPage: 10,
        totalApiNotices: 0, // API에서 불러온 공지사항의 총 개수
    };

    componentDidMount() {
        this.fetchNotices();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentPage !== this.state.currentPage) {
            this.updateDisplayNotices();
        }
    }

    fetchNotices = async () => {
        try {
            this.setState({ loading: true, error: null });
            // '공지' 카테고리의 게시글만 가져옴
            const response = await axios.get(`${API_BASE_URL}/api/posts?category=공지`);
            const fetchedNotices = response.data.posts || [];

            // 날짜 기준으로 내림차순 정렬 (최신 공지가 위로)
            const sortedNotices = [...fetchedNotices].sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            this.setState({
                allNotices: sortedNotices,
                totalApiNotices: sortedNotices.length, // API 공지사항 수 저장
                loading: false,
            }, this.updateDisplayNotices);

        } catch (error) {
            console.error("Failed to load notices:", error.response ? error.response.data : error.message);
            this.setState({
                error: "공지사항을 불러오는 데 실패했습니다.",
                loading: false,
            });
        }
    };

    updateDisplayNotices = () => {
        const { allNotices, currentPage, noticesPerPage } = this.state;
        // 특별 공지사항은 페이지네이션 계산에서 제외하고 항상 첫 페이지에 고정
        const startIndex = (currentPage - 1) * noticesPerPage;
        const endIndex = startIndex + noticesPerPage;
        const currentNotices = allNotices.slice(startIndex, endIndex);
        this.setState({ displayNotices: currentNotices });
    };

    handlePageChange = (pageNumber) => {
        const { totalApiNotices, noticesPerPage } = this.state;
        const totalPages = Math.ceil(totalApiNotices / noticesPerPage) + (totalApiNotices === 0 ? 1 : 0); // API 공지가 없으면 특별 공지 1페이지 유지

        if (pageNumber < 1 || pageNumber > totalPages) return;
        this.setState({ currentPage: pageNumber });
    };

    getPageNumbers = () => {
        const { totalApiNotices, noticesPerPage, currentPage } = this.state;
        const totalPages = Math.ceil(totalApiNotices / noticesPerPage) + (totalApiNotices === 0 ? 1 : 0); // API 공지가 없으면 특별 공지 1페이지 유지

        const pageNumbers = [];
        const maxPageNumbersToShow = 5;
        let startPage;
        let endPage;

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

    render() {
        const { t } = this.props;
        const { displayNotices, loading, error, currentPage, totalApiNotices, noticesPerPage } = this.state;
        const totalPages = Math.ceil(totalApiNotices / noticesPerPage) + (totalApiNotices === 0 ? 1 : 0); // API 공지가 없으면 특별 공지 1페이지 유지

        // 하드코딩된 특별 공지사항 데이터
        const specialNotice = {
            id: 'special-job-notice', // CommunityPage와 PostDetailPage와 동일한 ID 사용
            titleKey: 'special_notice_job_title',
            descriptionKey: 'special_notice_job_desc',
            link: '/community/post/special-job-notice', // 상세 페이지로 이동
            isImportant: true,
            createdAt: new Date().toISOString(), // 현재 날짜로 설정
            author: '운영팀', // 관리자 계정으로 설정
            category: '공지' // 카테고리 설정
        };

        // 현재 페이지에 표시될 공지 목록 (특별 공지는 1페이지에만 고정)
        const noticesToRender = (currentPage === 1) ? [specialNotice, ...displayNotices] : displayNotices;

        if (loading) return <div className="community-page-container"><p>{t('loading_data', '데이터를 불러오는 중...')}</p></div>;
        if (error) return <div className="community-page-container"><p className="error-message">{error}</p></div>;

        return (
            <div className="community-page-container vibrant-theme">
                <div className="post-detail-header">
                    <Link to="/community" className="back-button">
                        <FaArrowLeft /> {t('back_to_community', '커뮤니티로 돌아가기')}
                    </Link>
                    <h1>{t('all_notices_title', '모든 공지사항')}</h1>
                </div>

                <section className="community-section notice-list-page-section">
                    <h2 className="section-title">
                        <FaBullhorn className="section-icon" /> {t('all_notices_heading', '최신 공지')}
                    </h2>
                    <ul className="notice-list-full">
                        {noticesToRender.length > 0 ? (
                            noticesToRender.map(notice => (
                                <li key={notice.id} className={`notice-list-full-item ${notice.isImportant ? 'is-important' : ''}`}>
                                    {/* Link to detail page using notice.id*/}
                                    <Link to={`/community/post/${notice.id}`} className="notice-list-full-link">
                                        <span className="notice-type-badge">
                                            {notice.isImportant ? t('notice_badge_important', '중요') : t('notice_badge', '공지')}
                                        </span>
                                        <div className="notice-content-wrapper">
                                            {/* titleKey/descriptionKey는 하드코딩된 특별 공지용, title/content는 API 공지용*/}
                                            <h3 className="notice-list-full-title">
                                                {notice.titleKey ? t(notice.titleKey, notice.titleKey) : notice.title}
                                            </h3>
                                            <p className="notice-list-full-description">
                                                {notice.descriptionKey ? t(notice.descriptionKey, notice.descriptionKey) : notice.content}
                                            </p>
                                        </div>
                                        <span className="notice-list-full-date"><FaCalendarAlt /> {
                                            notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                                                year: 'numeric', month: '2-digit', day: '2-digit'
                                            }).replace(/\. /g, '.').replace(/\.$/, '') : ''
                                        }</span>
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                                {t('no_notices_yet', '아직 등록된 공지사항이 없습니다.')}
                            </p>
                        )}
                    </ul>

                    {/* 페이지네이션 UI - 특별 공지사항 제외하고 실제 데이터에 대해서만*/}
                    {totalApiNotices > 0 || (totalApiNotices === 0 && currentPage === 1) ? ( // API 공지가 없어도 첫 페이지에 특별 공지를 위해 페이지네이션 표시
                        <div className="pagination">
                            <button
                                onClick={() => this.handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-button"
                            >
                                <FaChevronLeft />
                            </button>
                            {this.getPageNumbers().map(number => (
                                <button
                                    key={number}
                                    onClick={() => this.handlePageChange(number)}
                                    className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                                >
                                    {number}
                                </button>
                            ))}
                            <button
                                onClick={() => this.handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-button"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    ) : null}
                </section>
            </div>
        );
    }
}

export default withTranslation()(NoticeListPage);
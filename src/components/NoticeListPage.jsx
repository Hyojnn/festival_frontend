// frontend/src/components/NoticeListPage.jsx (수정된 부분)

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { FaBullhorn, FaArrowLeft, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../communityPage.css';

// 공지사항 더미 데이터
const dummyNotices = [
    {
        id: 'notice_volunteer_staff',
        titleKey: 'home_service_banner_1_title',
        descriptionKey: 'home_service_banner_1_desc',
        link: '/info/travel_tips',
        isImportant: true,
        date: '2024.06.01'
    },
    {
        id: 'notice_server_check',
        titleKey: 'notice_title_2',
        descriptionKey: 'notice_desc_2',
        link: '/community/post/notice2',
        isImportant: false,
        date: '2024.05.25'
    },
    {
        id: 'notice_privacy_policy',
        titleKey: 'notice_title_3',
        descriptionKey: 'notice_desc_3',
        link: '/community/post/notice3',
        isImportant: false,
        date: '2024.05.20'
    },
    {
        id: 'notice_data_update',
        titleKey: 'notice_title_4',
        descriptionKey: 'notice_desc_4',
        link: '/community/post/notice4',
        isImportant: false,
        date: '2024.05.15'
    },
    {
        id: 'notice_rules_change',
        titleKey: 'notice_title_5',
        descriptionKey: 'notice_desc_5',
        link: '/community/post/notice5',
        isImportant: false,
        date: '2024.05.10'
    },
    { id: 'notice_tip6', titleKey: 'travel_tip_1_title', descriptionKey: 'travel_tip_1_summary', link: '/info/travel_tips', isImportant: false, date: '2024.05.09' },
    { id: 'notice_tip7', titleKey: 'travel_tip_2_title', descriptionKey: 'travel_tip_2_summary', link: '/info/safety_guide', isImportant: false, date: '2024.05.08' },
    { id: 'notice_tip8', titleKey: 'travel_tip_3_title', descriptionKey: 'travel_tip_3_summary', link: '/info/travel_tips', isImportant: false, date: '2024.05.07' },
    { id: 'notice_tip9', titleKey: 'travel_tip_4_title', descriptionKey: 'travel_tip_4_summary', link: '/info/safety_guide', isImportant: false, date: '2024.05.06' },
    { id: 'notice_tip10', titleKey: 'travel_tip_5_title', descriptionKey: 'travel_tip_5_summary', link: '/info/travel_tips', isImportant: false, date: '2024.05.05' },
    { id: 'notice_tip11', titleKey: 'travel_tip_1_title', descriptionKey: 'travel_tip_1_summary', link: '/info/travel_tips', isImportant: false, date: '2024.05.04' },
    { id: 'notice_tip12', titleKey: 'travel_tip_2_title', descriptionKey: 'travel_tip_2_summary', link: '/info/safety_guide', isImportant: false, date: '2024.05.03' },
    { id: 'notice_tip13', titleKey: 'travel_tip_3_title', descriptionKey: 'travel_tip_3_summary', link: '/info/travel_tips', isImportant: false, date: '2024.05.02' },
   
];

class NoticeListPage extends Component {
    state = {
        allNotices: [],
        displayNotices: [],
        loading: true,
        error: null,
        currentPage: 1,
        noticesPerPage: 10,
        totalNotices: 0,
    };

    componentDidMount() {
        setTimeout(() => {
            try {
                const sortedNotices = [...dummyNotices].sort((a, b) => {
                    if (a.isImportant && !b.isImportant) return -1;
                    if (!a.isImportant && b.isImportant) return 1;
                    return new Date(b.date.replace(/\./g, '-')) - new Date(a.date.replace(/\./g, '-'));
                });

                this.setState({
                    allNotices: sortedNotices,
                    totalNotices: sortedNotices.length,
                    loading: false,
                }, this.updateDisplayNotices);
            } catch (error) {
                console.error("Failed to load notices:", error);
                this.setState({
                    error: "공지사항을 불러오는 데 실패했습니다.",
                    loading: false,
                });
            }
        }, 500);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentPage !== this.state.currentPage) {
            this.updateDisplayNotices();
        }
    }

    updateDisplayNotices = () => {
        const { allNotices, currentPage, noticesPerPage } = this.state;
        const startIndex = (currentPage - 1) * noticesPerPage;
        const endIndex = startIndex + noticesPerPage;
        const currentNotices = allNotices.slice(startIndex, endIndex);
        this.setState({ displayNotices: currentNotices });
    };

    handlePageChange = (pageNumber) => {
        const { totalNotices, noticesPerPage } = this.state;
        const totalPages = Math.ceil(totalNotices / noticesPerPage);

        if (pageNumber < 1 || pageNumber > totalPages) return;
        this.setState({ currentPage: pageNumber });
    };

    getPageNumbers = () => {
        const { totalNotices, noticesPerPage, currentPage } = this.state;
        const totalPages = Math.ceil(totalNotices / noticesPerPage);
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
        const { displayNotices, loading, error, currentPage, totalNotices, noticesPerPage } = this.state;
        const totalPages = Math.ceil(totalNotices / noticesPerPage);

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
                        {displayNotices.length > 0 ? (
                            displayNotices.map(notice => (
                                <li key={notice.id} className={`notice-list-full-item ${notice.isImportant ? 'is-important' : ''}`}>
                                    <Link to={notice.link} className="notice-list-full-link">
                                        <span className="notice-type-badge">
                                            {notice.isImportant ? t('notice_badge_important', '중요') : t('notice_badge', '공지')}
                                        </span>
                                        <div className="notice-content-wrapper">
                                            <h3 className="notice-list-full-title">{t(notice.titleKey, notice.titleKey)}</h3>
                                            <p className="notice-list-full-description">{t(notice.descriptionKey, notice.descriptionKey)}</p>
                                        </div>
                                        <span className="notice-list-full-date"><FaCalendarAlt /> {notice.date}</span>
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                                {t('no_notices_yet', '아직 등록된 공지사항이 없습니다.')}
                            </p>
                        )}
                    </ul>

                    {/* 페이지네이션 UI */}
                    {/* totalNotices가 0보다 클 때만 페이지네이션 표시 */}
                    {totalNotices > 0 && (
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
                    )}
                </section>
            </div>
        );
    }
}

export default withTranslation()(NoticeListPage);
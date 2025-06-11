// frontend/src/components/TravelTipListPage.jsx

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { FaLightbulb, FaArrowLeft, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaUserCircle, FaInfoCircle } from 'react-icons/fa'; // FaInfoCircle 추가
import axios from 'axios';
import '../communityPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ADMIN_USERNAME = 'admin';

class TravelTipListPage extends Component {
    state = {
        allTips: [],
        displayTips: [],
        loading: true,
        error: null,
        currentPage: 1,
        tipsPerPage: 10,
        totalTips: 0,
    };

    componentDidMount() {
        this.fetchTips();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentPage !== this.state.currentPage) {
            this.updateDisplayTips();
        }
    }

    fetchTips = async () => {
        try {
            this.setState({ loading: true, error: null });
            // '꿀팁' 카테고리의 게시글만 가져옴
            const response = await axios.get(`${API_BASE_URL}/api/posts?category=꿀팁`);
            const fetchedTips = response.data.posts || [];

            // 날짜 기준으로 내림차순 정렬 (최신 꿀팁이 위로)
            const sortedTips = [...fetchedTips].sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            this.setState({
                allTips: sortedTips,
                totalTips: sortedTips.length,
                loading: false,
            }, this.updateDisplayTips);

        } catch (error) {
            console.error("Failed to load tips:", error.response ? error.response.data : error.message);
            this.setState({
                error: "꿀팁을 불러오는 데 실패했습니다.",
                loading: false,
            });
        }
    };

    updateDisplayTips = () => {
        const { allTips, currentPage, tipsPerPage } = this.state;
        const startIndex = (currentPage - 1) * tipsPerPage;
        const endIndex = startIndex + tipsPerPage;
        const currentTips = allTips.slice(startIndex, endIndex);
        this.setState({ displayTips: currentTips });
    };

    handlePageChange = (pageNumber) => {
        const { totalTips, tipsPerPage } = this.state;
        const totalPages = Math.ceil(totalTips / tipsPerPage);

        if (pageNumber < 1 || pageNumber > totalPages) return;
        this.setState({ currentPage: pageNumber });
    };

    getPageNumbers = () => {
        const { totalTips, tipsPerPage, currentPage } = this.state;
        const totalPages = Math.ceil(totalTips / tipsPerPage);
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
        const { displayTips, loading, error, currentPage, totalTips, tipsPerPage } = this.state;
        const totalPages = Math.ceil(totalTips / tipsPerPage);

        if (loading) return <div className="community-page-container"><p>{t('loading_data', '데이터를 불러오는 중...')}</p></div>;
        if (error) return <div className="community-page-container"><p className="error-message">{error}</p></div>;

        return (
            <div className="community-page-container vibrant-theme">
                <div className="post-detail-header">
                    <Link to="/community" className="back-button">
                        <FaArrowLeft /> {t('back_to_community', '커뮤니티로 돌아가기')}
                    </Link>
                    <h1>{t('all_tips_title', '모든 꿀팁')}</h1>
                </div>

                <section className="community-section travel-tip-list-section">
                    <h2 className="section-title"><FaLightbulb className="section-icon" /> {t('all_tips_heading', '최신 꿀팁')}</h2>
                    {displayTips.length > 0 ? (
                        // CommunityPage의 travel-tips-list와 유사한 구조로 변경
                        <div className="travel-tips-list">
                            {displayTips.map(tip => (
                                <Link to={`/community/post/${tip.id}`} key={tip.id} className="travel-tip-item">
                                    <div className="tip-icon-wrapper">
                                        <FaInfoCircle size={24} /> {/* 꿀팁 아이콘 */}
                                    </div>
                                    <div className="tip-content">
                                        <h4 className="tip-title">{tip.title}</h4>
                                        <p className="tip-summary">{tip.content}</p> {/* 꿀팁 내용 필드를 summary로 사용 */}
                                    </div>
                                    <FaChevronRight className="tip-arrow" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                            {t('no_tips_yet', '아직 등록된 꿀팁이 없습니다.')}
                        </p>
                    )}

                    {/* 페이지네이션 UI */}
                    {totalTips > 0 && (
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

export default withTranslation()(TravelTipListPage);
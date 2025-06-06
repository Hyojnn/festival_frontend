import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { FaLightbulb, FaArrowLeft, FaChevronRight } from 'react-icons/fa';
import '../communityPage.css'; // 커뮤니티 페이지와 동일한 CSS 사용

// 여행 꿀팁 더미 데이터 (CommunityPage의 staticTravelTips와 유사)
const dummyTravelTips = [
    { id: 'tip1', titleKey: 'travel_tip_1_title', summaryKey: 'travel_tip_1_summary', icon: <FaLightbulb size={24} />, link: '/info/travel_tips' },
    { id: 'tip2', titleKey: 'travel_tip_2_title', summaryKey: 'travel_tip_2_summary', icon: <FaLightbulb size={24} />, link: '/info/safety_guide' }, // 예시 링크 변경
    { id: 'tip3', titleKey: 'travel_tip_3_title', summaryKey: 'travel_tip_3_summary', icon: <FaLightbulb size={24} />, link: '/info/travel_tips' },
    { id: 'tip4', titleKey: 'travel_tip_4_title', summaryKey: 'travel_tip_4_summary', icon: <FaLightbulb size={24} />, link: '/info/safety_guide' },
    { id: 'tip5', titleKey: 'travel_tip_5_title', summaryKey: 'travel_tip_5_summary', icon: <FaLightbulb size={24} />, link: '/info/travel_tips' },
];

class TravelTipListPage extends Component {
    // 실제로는 여기서 API 호출을 통해 꿀팁 데이터를 불러옵니다.
    state = {
        travelTips: dummyTravelTips,
        loading: false,
        error: null,
    };

    render() {
        const { t } = this.props;
        const { travelTips, loading, error } = this.state;

        if (loading) return <div className="community-page-container"><p>{t('loading_data')}</p></div>;
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
                    <div className="travel-tips-list">
                        {travelTips.map(tip => (
                            <Link to={tip.link} key={tip.id} className="travel-tip-item">
                                <div className="tip-icon-wrapper">{tip.icon}</div>
                                <div className="tip-content">
                                    <h4 className="tip-title">{t(tip.titleKey, tip.titleKey)}</h4>
                                    <p className="tip-summary">{t(tip.summaryKey, tip.summaryKey)}</p>
                                </div>
                                <FaChevronRight className="tip-arrow" />
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        );
    }
}

export default withTranslation()(TravelTipListPage);
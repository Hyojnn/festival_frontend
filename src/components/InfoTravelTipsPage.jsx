import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { FaClipboardList, FaArrowLeft } from 'react-icons/fa';
import '../communityPage.css'; // 기본 스타일을 위해 커뮤니티 CSS 사용

function InfoTravelTipsPage({ t }) {
    return (
        <div className="community-page-container vibrant-theme">
            <div className="post-detail-header">
                <Link to="/" className="back-button">
                    <FaArrowLeft /> {t('back_to_home', '홈으로 돌아가기')}
                </Link>
                <h1>{t('info_travel_tips_title', '여행 꿀팁 상세 가이드')}</h1>
            </div>

            <section className="community-section info-content-section">
                <h2 className="section-title"><FaClipboardList className="section-icon" /> {t('info_travel_tips_heading', '성공적인 여행을 위한 꿀팁')}</h2>
                <div className="info-content">
                    <p>{t('info_travel_tips_p1', '여행 계획은 미리 세우는 것이 좋습니다. 항공권과 숙소는 일찍 예약할수록 저렴하게 구할 수 있습니다.')}</p>
                    <p>{t('info_travel_tips_p2', '짐을 쌀 때는 필요한 물품 리스트를 작성하고, 현지 날씨를 고려하여 옷을 준비하세요. 휴대용 충전기와 상비약은 필수입니다.')}</p>
                    <p>{t('info_travel_tips_p3', '여행 중에는 현지 문화를 존중하고, 안전에 유의해야 합니다. 비상 연락처와 여권 사본은 항상 소지하는 것이 좋습니다.')}</p>
                    <p>{t('info_travel_tips_p4', '축제에 방문할 때는 미리 행사 일정과 지도를 확인하고, 편한 신발을 착용하는 것이 좋습니다.')}</p>
                    {/* 이미지나 다른 콘텐츠 추가 가능 */}
                    {/* <img src="/images/travel_tips_detail.jpg" alt="여행 꿀팁 이미지" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', margin: '20px 0' }} /> */}
                </div>
            </section>
        </div>
    );
}

export default withTranslation()(InfoTravelTipsPage);
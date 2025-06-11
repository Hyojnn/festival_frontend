import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import '../communityPage.css'; // 기본 스타일을 위해 커뮤니티 CSS 사용

function InfoSafetyGuidePage({ t }) {
    return (
        <div className="community-page-container vibrant-theme">
            <div className="post-detail-header">
                <Link to="/" className="back-button">
                    <FaArrowLeft /> {t('back_to_home', '홈으로 돌아가기')}
                </Link>
                <h1>{t('info_safety_guide_title', '안전 여행 가이드')}</h1>
            </div>

            <section className="community-section info-content-section">
                <h2 className="section-title"><FaShieldAlt className="section-icon" /> {t('info_safety_guide_heading', '안전한 축제 및 여행을 위한 안내')}</h2>
                <div className="info-content">
                    <p>{t('info_safety_guide_p1', '낯선 곳을 여행할 때는 항상 주변 환경에 주의를 기울이세요. 혼자 밤늦게 다니는 것을 피하고, 인적이 드문 곳은 가지 않는 것이 좋습니다.')}</p>
                    <p>{t('info_safety_guide_p2', '귀중품은 눈에 띄지 않게 보관하고, 현금을 많이 소지하는 대신 신용카드나 모바일 페이를 이용하는 것이 안전합니다.')}</p>
                    <p>{t('info_safety_guide_p3', '비상 상황에 대비하여 현지 대사관이나 영사관의 연락처, 긴급 전화번호(경찰, 구급차)를 미리 알아두세요.')}</p>
                    <p>{t('info_safety_guide_p4', '음료나 음식은 낯선 사람으로부터 받지 않도록 주의하고, 개인 위생에도 신경 써서 건강을 지키세요.')}</p>
                    {/* 이미지나 다른 콘텐츠 추가 가능 */}
                    {/* <img src="/images/safety_guide_detail.jpg" alt="안전 가이드 이미지" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', margin: '20px 0' }} /> */}
                </div>
            </section>
        </div>
    );
}

export default withTranslation()(InfoSafetyGuidePage);
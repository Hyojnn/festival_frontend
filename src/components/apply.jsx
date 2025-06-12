// frontend/src/components/apply.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaUserFriends, FaBriefcase, FaCalendarAlt, FaMoon, FaCheckCircle, FaPaperPlane, FaUndo, FaListAlt } from 'react-icons/fa';
import '../SupportForm.css'; // 이 페이지의 스타일은 SupportForm.css를 사용합니다.

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SupportForm = ({ userId }) => {
    const [region, setRegion] = useState('');
    const [ageGroup, setAgeGroup] = useState('');
    const [jobType, setJobType] = useState('');
    const [availableFrom, setAvailableFrom] = useState('');
    const [availableTo, setAvailableTo] = useState('');
    const [preferences, setPreferences] = useState({ nightShift: false });
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!region || !ageGroup || !jobType || !availableFrom || !availableTo) {
            alert('필수 입력 항목을 모두 채워주세요.');
            return;
        }
        setLoading(true);
        setError(null);
        setRecommendations([]);
        try {
            await axios.post(`${API_BASE_URL}/api/support-info`, { userId, region, ageGroup, jobType, availableFrom, availableTo, preferences });
            const res = await axios.post(`${API_BASE_URL}/jobrecommend`, { userId });
            setRecommendations(res.data.recommendations || []);
            setSubmitted(true);
        } catch (err) {
            console.error('지원 정보 저장 또는 추천 조회 중 오류:', err);
            setError('오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setRegion('');
        setAgeGroup('');
        setJobType('');
        setAvailableFrom('');
        setAvailableTo('');
        setPreferences({ nightShift: false });
        setRecommendations([]);
        setError(null);
        setSubmitted(false);
    };

    return (
        <div className="support-form-body">
            <div className="support-form-container">
                {!submitted ? (
                    <>
                        <div className="form-header">
                            <FaBriefcase className="header-icon" />
                            <h1 className="form-title">축제 일자리 지원</h1>
                            <p className="form-description">나에게 꼭 맞는 축제 일자리를 추천받아 보세요!</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="region"><FaMapMarkerAlt /> 거주 지역 (시/도)</label>
                                    <select id="region" value={region} onChange={e => setRegion(e.target.value)} required>
                                        <option value="">지역 선택</option>
                                        <option value="서울특별시">서울특별시</option>
                                        <option value="부산광역시">부산광역시</option>
                                        <option value="대구광역시">대구광역시</option>
                                        <option value="인천광역시">인천광역시</option>
                                        <option value="대전광역시">대전광역시</option>
                                        <option value="울산광역시">울산광역시</option>
                                        <option value="경기도">경기도</option>
                                        <option value="충청북도">충청북도</option>
                                        <option value="충청남도">충청남도</option>
                                        <option value="전북특별자치도">전북특별자치도</option>
                                        <option value="전라남도">전라남도</option>
                                        <option value="경상북도">경상북도</option>
                                        <option value="경상남도">경상남도</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ageGroup"><FaUserFriends /> 연령대</label>
                                    <select id="ageGroup" value={ageGroup} onChange={e => setAgeGroup(e.target.value)} required>
                                        <option value="">연령대 선택</option>
                                        <option value="10대">10대</option>
                                        <option value="20대">20대</option>
                                        <option value="30대">30대</option>
                                        <option value="40대">40대</option>
                                        <option value="50대">50대 이상</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="jobType"><FaListAlt /> 희망 업무 유형</label>
                                <select id="jobType" value={jobType} onChange={e => setJobType(e.target.value)} required>
                                    <option value="">업무 유형 선택</option>
                                    <option value="음식 판매">음식 판매</option>
                                    <option value="행사 진행">행사 진행</option>
                                    <option value="안내">안내</option>
                                    <option value="부스담당">부스담당</option>
                                    <option value="안전/청결">안전/청결</option>
                                    <option value="교통/주차">교통/주차</option>
                                    <option value="통역/외국어">통역/외국어</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label><FaCalendarAlt /> 지원 가능 기간</label>
                                <div className="date-range-picker">
                                    <input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} required />
                                    <span>~</span>
                                    <input type="date" value={availableTo} onChange={e => setAvailableTo(e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-group checkbox-group">
                                <input id="nightShift" type="checkbox" checked={preferences.nightShift} onChange={e => setPreferences(prev => ({ ...prev, nightShift: e.target.checked }))} />
                                <label htmlFor="nightShift"><FaMoon /> 야간 근무 가능</label>
                            </div>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? '처리 중...' : <><FaPaperPlane /> 지원 및 추천받기</>}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="recommendation-results-container">
                        <div className="form-header">
                            <FaCheckCircle className="header-icon success" />
                            <h1 className="form-title">추천 결과</h1>
                            <p className="form-description">내 정보에 꼭 맞는 축제 일자리를 확인해 보세요!</p>
                        </div>
                        {loading ? <p>추천 목록을 불러오는 중...</p> : (
                            <ul className="recommendation-list">
                                {recommendations.length > 0 ? recommendations.map((item, idx) => (
                                    <li key={idx} className="recommendation-card">
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                            <div className="card-content">
                                                <strong className="card-title">{item.title}</strong>
                                                <span className="card-link-text">상세보기 &rarr;</span>
                                            </div>
                                        </a>
                                    </li>
                                )) : <p>아쉽지만, 현재 조건에 맞는 추천 일자리가 없습니다.</p>}
                            </ul>
                        )}
                        <button onClick={resetForm} className="reset-btn">
                            <FaUndo /> 다시 지원하기
                        </button>
                    </div>
                )}
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default SupportForm;
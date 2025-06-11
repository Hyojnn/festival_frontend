import React, { useState } from 'react';
import axios from 'axios';
import '../SupportForm.css';


const API_BASE_URL = process.env.REACT_APP_API_URL;
const SupportForm = ({ userId }) => {
  const [region, setRegion] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [jobType, setJobType] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [preferences, setPreferences] = useState({
    nightShift: false,
  });

  const [recommendations, setRecommendations] = useState([]); // 추천 결과 저장
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [submitted, setSubmitted] = useState(false); // 제출 여부

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
      // 1) 지원 정보 저장
      console.log('지원 정보 저장 요청');
      await axios.post(`${API_BASE_URL}/api/support-info`, {
        userId,
        region,
        ageGroup,
        jobType,
        availableFrom,
        availableTo,
        preferences,
      });

      // 2) 추천 결과 요청
      console.log('추천 요청');
      const res = await axios.post(`${API_BASE_URL}/jobrecommend`, { userId });
      
      setRecommendations(res.data.recommendations || []);
      setSubmitted(true); // 제출 완료 처리
      
      console.log('추천 결과 응답:', res.data);
    } catch (err) {
      console.error('❌ axios 요청 실패:', err.response?.data || err.message);
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 폼 리셋 함수 (원하면 사용)
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
    <>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <label>
            거주 지역 (시/도):<br />
            <select value={region} onChange={e => setRegion(e.target.value)} required>
              <option value="">선택</option>
              <option value="서울특별시">서울특별시</option>
              <option value="부산광역시">부산광역시</option>
              <option value="대구광역시">대구광역시</option>
              <option value="인천광역시">인천광역시</option>
              <option value="대전광역시">대전광역시</option>
              <option value="울산광역시">울산광역시</option>
              <option value="경기도">경기도</option>
              <option value="충청북도">충청북도</option>
              <option value="충청남도">충청남도</option>
              <option value="전북특별차지도">전북특별차지도</option>
              <option value="전라남도">전라남도</option>
              <option value="경상북도">경상북도</option>
              <option value="경상남도">경상남도</option>
            </select>
          </label>

          <br /><br />

          <label>
            연령대:<br />
            <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} required>
              <option value="">선택</option>
              <option value="10대">10대</option>
              <option value="20대">20대</option>
              <option value="30대">30대</option>
              <option value="40대">40대</option>
              <option value="50대">50대</option>
            </select>
          </label>

          <br /><br />

          <label>
            희망 업무 유형:<br />
            <select value={jobType} onChange={e => setJobType(e.target.value)} required>
              <option value="">선택</option>
              <option value="음식 판매">음식 판매</option>
              <option value="행사 진행">행사 진행</option>
              <option value="안내">안내</option>
              <option value="부스담당">부스담당</option>
              <option value="안전/청결">안전/청결</option>
              <option value="교통/주차">교통/주차</option>
              <option value="통역/외국어">통역/외국어</option>
            </select>
          </label>

          <br /><br />

          <label>
            지원 가능 기간:<br />
            <input
              type="date"
              value={availableFrom}
              onChange={e => setAvailableFrom(e.target.value)}
              required
            />{' '}
            ~{' '}
            <input
              type="date"
              value={availableTo}
              onChange={e => setAvailableTo(e.target.value)}
              required
            />
          </label>

          <br /><br />

          <label>
            야간 근무 가능:{' '}
            <input
              type="checkbox"
              checked={preferences.nightShift}
              onChange={e =>
                setPreferences(prev => ({ ...prev, nightShift: e.target.checked }))
              }
            />
          </label>

          <br /><br />

          <button type="submit" disabled={loading}>
            {loading ? '처리중...' : '지원 정보 저장 및 추천 받기'}
          </button>
        </form>
      ) : (
        <>
          <h3 style={{ marginBottom: '20px' }}>추천 일자리 목록</h3>
    <div className="recommendation-list">
      {recommendations.map((item, idx) => (
        <div className="recommendation-card" key={idx}>
          <h4>{item.title}</h4>
          {item.location && <p>📍 {item.location}</p>}
          {item.date && <p>📅 {item.date}</p>}
          <a href={item.url} target="_blank" rel="noreferrer">
            자세히 보기 →
          </a>
        </div>
      ))}
    </div>

          <button onClick={resetForm} style={{ marginTop: '20px' }}>
            처음부터 다시
          </button>
        </>
      )}

      <br />

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </>
  );
};

export default SupportForm;

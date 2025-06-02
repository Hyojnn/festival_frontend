import React, { useEffect, useRef, useState } from 'react';
import '../map.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Map = ({ level = 4 }) => {
  const mapRef       = useRef(null);
  const [festivals, setFestivals]   = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // 1) Kakao SDK를 autoload=false 옵션으로 동적 로드
  useEffect(() => {
    if (window.kakao && window.kakao.maps) return; // 이미 로드된 상태면 넘어감
    if (document.getElementById('kakao-map-sdk')) return;

    const script = document.createElement('script');
    script.id = 'kakao-map-sdk';
    // ↓ 반드시 &autoload=false 를 붙여야 kakao.maps.load()가 정상 동작합니다.
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&libraries=services,clusterer&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // 필요 시 언마운트할 때 제거할 수 있지만 보통 그대로 둡니다.
      // document.head.removeChild(script);
    };
  }, []);

  // 2) JSON 데이터 fetch & 파싱
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/festivals`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        const items = Array.isArray(data.festivals) ? data.festivals : [];
        const parsed = items
          .map(item => ({
            id:        item.name,
            name:      item.name,
            roadAddr:  (item.address || '').trim(),
            jibunAddr: '',
            lat:       null,
            lng:       null,
          }))
          .filter(f => f.roadAddr);

        setFestivals(parsed);
      })
      .catch(err => {
        setError(`데이터 로드 실패: ${err.message}`);
      })
      .finally(() => setDataLoaded(true));
  }, []);

  // 3) Kakao SDK 로드 & 지도 초기화
  useEffect(() => {
    if (!dataLoaded) return;

    // SDK가 로드되지 않았거나 kakao.maps.load 함수가 없으면 오류 처리
    if (!window.kakao || !window.kakao.maps || typeof window.kakao.maps.load !== 'function') {
      setError('Kakao SDK 로드 실패');
      setLoading(false);
      return;
    }

    // SDK가 완전히 로딩된 이후에 kakao.maps.load 콜백이 호출됨
    window.kakao.maps.load(() => {
      const { kakao } = window;
      const container = mapRef.current;
      if (!container) {
        setError('지도 컨테이너를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      // 주소를 위/경도로 변환해 주는 함수
      const getCoordFromAddress = address => {
        return new Promise(resolve => {
          if (!address) return resolve(null);
          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.addressSearch(address, (res, status) => {
            if (status === kakao.maps.services.Status.OK && res[0]) {
              // 제대로 결과가 왔을 때 LatLng 객체 생성
              return resolve(new kakao.maps.LatLng(res[0].y, res[0].x));
            }
            // 첫 번째 방법으로 잘 안 나오면 keywordSearch로 다시 시도
            const places = new kakao.maps.services.Places();
            places.keywordSearch(address, (res2, stat2) => {
              if (stat2 === kakao.maps.services.Status.OK && res2[0]) {
                return resolve(new kakao.maps.LatLng(res2[0].y, res2[0].x));
              }
              resolve(null);
            });
          });
        });
      };

      // 지도를 생성
      const map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level,
      });

      // 페스티벌 목록을 위/경도로 변환
      const coordPromises = festivals.map(f =>
        getCoordFromAddress(f.roadAddr)
      );

      Promise.all(coordPromises).then(coords => {
        const valid = coords
          .map((coord, i) => coord ? { ...festivals[i], coord } : null)
          .filter(x => x);

        if (valid.length === 0) {
          setError('유효한 축제 위치를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        // Bounds 계산 및 Marker 찍기
        const bounds = new kakao.maps.LatLngBounds();
        valid.forEach(f => {
          bounds.extend(f.coord);
          const marker = new kakao.maps.Marker({ map, position: f.coord });
          const info = new kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:14px;">
                        <strong>${f.name}</strong><br/>
                        ${f.roadAddr}
                      </div>`
          });
          kakao.maps.event.addListener(marker, 'mouseover', () => info.open(map, marker));
          kakao.maps.event.addListener(marker, 'mouseout',  () => info.close());
        });

        if (valid.length > 1) {
          map.setBounds(bounds);
        } else {
          map.setCenter(valid[0].coord);
        }

        // 타일 로드가 끝나면 loading false 처리
        kakao.maps.event.addListener(map, 'tilesloaded', () => setLoading(false));
      });
    });
  }, [dataLoaded, festivals, level]);

  return (
    <div className="map-wrapper">
      {loading && <div className="map-loading" />}
      <div ref={mapRef} className="map-container" />
      {error && <div className="map-error">{error}</div>}
    </div>
  );
};

export default Map;

import React, { useEffect, useRef, useState } from 'react';
import '../map.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Map = ({ level = 4 }) => {
  const mapRef       = useRef(null);
  const [festivals, setFestivals]   = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // 신규: 사용자 현재 위치(lat,lng)를 저장할 상태
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });

  // 1) Kakao SDK를 autoload=false 옵션으로 동적 로드
  useEffect(() => {
    if (window.kakao && window.kakao.maps) return; // 이미 로드된 상태면 넘어감
    if (document.getElementById('kakao-map-sdk')) return;

    const script = document.createElement('script');
    script.id = 'kakao-map-sdk';
    // ↓ 반드시 &autoload=false 를 붙여야 kakao.maps.load()가 정상 동작합니다.
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&libraries=services,clusterer&autoload=false`;
    script.async = true;
    script.onload = () => {
      // SDK 로드가 완료되면 여기에 특별히 할 작업이 없으므로 그냥 넘어갑니다.
    };
    script.onerror = () => {
      setError('Kakao SDK 스크립트 로드 중 오류가 발생했습니다.');
      setLoading(false);
    };

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

  // 3) Map 초기화 로직: 데이터와 Kakao SDK가 모두 준비된 뒤에 실행
  useEffect(() => {
    if (!dataLoaded) return;
    if (!window.kakao || !window.kakao.maps || typeof window.kakao.maps.load !== 'function') {
      setError('Kakao SDK 로드 실패');
      setLoading(false);
      return;
    }

    // 사용자 위치를 비동기로 가져와야 지도 생성 시 center를 사용자 위치로 잡을 수 있음
    const fetchUserLocation = () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          return resolve(null);
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => {
            // 위치 정보 허용 거부 등의 이유로 실패하면 null로 반환
            resolve(null);
          }
        );
      });
    };

    // Kakao SDK가 로드된 이후에 지도 그리기
    window.kakao.maps.load(async () => {
      const { kakao } = window;
      const container = mapRef.current;
      if (!container) {
        setError('지도 컨테이너를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      // 1) 사용자 위치를 시도해서 가져와본다
      const userPos = await fetchUserLocation();
      if (userPos) {
        setUserLocation(userPos);
      }

      // 2) 지도 생성: 사용자 위치가 있으면 그걸 center로, 없으면 기본 좌표(서울 시청 등)로
      const initialCenter = userPos
        ? new kakao.maps.LatLng(userPos.lat, userPos.lng)
        : new kakao.maps.LatLng(37.5665, 126.9780);

      const map = new kakao.maps.Map(container, {
        center: initialCenter,
        level,
      });

      // (선택) 사용자 위치에 마커 찍기
      if (userPos) {
        const userMarker = new kakao.maps.Marker({
          map,
          position: new kakao.maps.LatLng(userPos.lat, userPos.lng),
          image: new kakao.maps.MarkerImage(
            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
            new kakao.maps.Size(24, 35)
          ), // 기본 마커 이미지 대신 스타 마커 사용
        });
        const userInfo = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:14px;">현재 위치</div>`
        });
        kakao.maps.event.addListener(userMarker, 'mouseover', () => userInfo.open(map, userMarker));
        kakao.maps.event.addListener(userMarker, 'mouseout', () => userInfo.close());
      }

      // 3) 주소를 위/경도로 변환해 주는 함수
      const getCoordFromAddress = address => {
        return new Promise(resolve => {
          if (!address) return resolve(null);
          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.addressSearch(address, (res, status) => {
            if (status === kakao.maps.services.Status.OK && res[0]) {
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

      // 4) 페스티벌 목록을 위/경도로 변환
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

        // 5) 모든 마커를 담을 LatLngBounds 생성
        const bounds = new kakao.maps.LatLngBounds();

        // 페스티벌 마커 찍기
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

        // 6) 맵 뷰 설정: 사용자 위치도 bounds에 포함시키고 싶다면, valid에 추가하거나 별도 extend
        if (userPos) {
          bounds.extend(new kakao.maps.LatLng(userPos.lat, userPos.lng));
        }

        if (valid.length > 0) {
          // 축제 및 (있다면) 사용자 위치 모두 포함하는 bounds로 필드 설정
          map.setBounds(bounds);
        }

        // 7) 타일 로드가 끝나면 loading false 처리
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

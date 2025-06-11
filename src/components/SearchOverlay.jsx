// frontend/src/components/SearchOverlay.jsx
import React, { Component } from 'react';
import axios from 'axios';
import '../SearchOverlay.css';
// import { Link } from 'react-router-dom'; // 상세 페이지 링크 시 필요
import { withTranslation } from 'react-i18next';

const MAX_RECENT_SEARCHES = 10;
const API_BASE_URL = process.env.REACT_APP_API_URL;

class SearchOverlay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchQuery: "",
            searchResults: [],
            searchLoading: false,
            searchError: null,
            hasPerformedSearch: false, // 검색이 실제로 수행되었는지 여부
            recentSearches: [],
            isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
            userName: localStorage.getItem("isLoggedIn") === "true" ? localStorage.getItem("userName") || "" : "",
        };
        this.searchInputRef = React.createRef();
    }

    // 오버레이가 열릴 때마다 검색 상태 초기화
    initializeSearchState = () => {
        this.setState({
            searchQuery: "",
            searchResults: [],
            hasPerformedSearch: false,
            searchError: null,
        });
        this.loadRecentSearches(); // 최근 검색어 다시 로드
    }

    componentDidMount() {
        if (this.props.isOpen) {
            this.initializeSearchState();
            if (this.searchInputRef.current) {
                this.searchInputRef.current.focus();
            }
        }
        window.addEventListener('keydown', this.handleKeyDown);
        // localStorage 변경 감지 이벤트 리스너 추가
        window.addEventListener('storage', this.handleStorageChangeForOverlay);
    }

    componentDidUpdate(prevProps) {
        // 오버레이가 닫혔다가 열릴 때 상태 초기화 및 검색 입력 필드 포커스
        if (this.props.isOpen && !prevProps.isOpen) {
            this.initializeSearchState();
            if (this.searchInputRef.current) {
                this.searchInputRef.current.focus();
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('storage', this.handleStorageChangeForOverlay);
    }

    // localStorage 변경 시 로그인 상태 및 최근 검색어 업데이트
    handleStorageChangeForOverlay = (event) => {
        if (event.key === 'isLoggedIn' || event.key === 'userName') {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            const userName = isLoggedIn ? localStorage.getItem("userName") || "" : "";
            this.setState({ isLoggedIn, userName }, () => {
                this.loadRecentSearches(); // 로그인 상태 변경 시 최근 검색어 다시 로드
            });
        }
    };

    // ESC 키 눌러 오버레이 닫기
    handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            this.props.onClose();
        }
    };

    // 최근 검색어 로드
    loadRecentSearches = () => {
        // 로그인 상태일 때만 최근 검색어 저장/로드
        if (this.state.isLoggedIn && this.state.userName) {
            const storedSearches = localStorage.getItem(`recentSearches_${this.state.userName}`);
            this.setState({ recentSearches: storedSearches ? JSON.parse(storedSearches) : [] });
        } else {
            // 비로그인 상태면 최근 검색어 비움
            this.setState({ recentSearches: [] });
        }
    };

    // 최근 검색어 추가
    addRecentSearch = (keyword) => {
        if (!keyword || !this.state.isLoggedIn || !this.state.userName) return; // 키워드 없거나 로그인 안 했으면 저장 안 함
        this.setState(prevState => {
            // 기존 검색어 중복 제거 및 맨 앞에 추가
            let updatedSearches = [keyword, ...prevState.recentSearches.filter(s => s.toLowerCase() !== keyword.toLowerCase())];
            // 최대 개수 유지
            if (updatedSearches.length > MAX_RECENT_SEARCHES) {
                updatedSearches = updatedSearches.slice(0, MAX_RECENT_SEARCHES);
            }
            localStorage.setItem(`recentSearches_${prevState.userName}`, JSON.stringify(updatedSearches));
            return { recentSearches: updatedSearches };
        });
    };

    // 최근 검색어 개별 삭제
    deleteRecentSearch = (keywordToDelete, e) => {
        e.stopPropagation(); // li 클릭 이벤트 버블링 방지
        if (!this.state.isLoggedIn || !this.state.userName) return;
        this.setState(prevState => {
            const updatedSearches = prevState.recentSearches.filter(s => s !== keywordToDelete);
            localStorage.setItem(`recentSearches_${prevState.userName}`, JSON.stringify(updatedSearches));
            return { recentSearches: updatedSearches };
        });
    };

    // 최근 검색어 전체 삭제
    handleClearAllRecentSearches = () => {
        const { t } = this.props;
        if (!this.state.isLoggedIn || !this.state.userName) return;
        if (window.confirm(t('confirm_clear_recent_searches'))) {
            localStorage.removeItem(`recentSearches_${this.state.userName}`);
            this.setState({ recentSearches: [] });
        }
    };

    // 최근 검색어 클릭 시 검색 실행
    handleRecentSearchClick = (keyword) => {
        this.setState({ searchQuery: keyword }, () => {
            this.executeSearch(keyword);
        });
    };

    // 검색 입력 필드 변경
    handleSearchInputChange = (e) => {
        const newQuery = e.target.value;
        this.setState({ searchQuery: newQuery });

        // 입력창이 비어있으면 검색 결과 및 에러 초기화
        if (newQuery.trim() === "") {
            this.setState({
                searchResults: [],
                searchLoading: false,
                searchError: null,
                hasPerformedSearch: false, // 검색 수행 여부도 초기화
            });
        }
    };

    // 실제 검색 API 호출 로직
    executeSearch = async (queryToSearch) => {
        const { t } = this.props;
        const trimmedQuery = queryToSearch ? queryToSearch.trim() : "";

        if (!trimmedQuery) {
            // 검색어가 없으면 검색 결과 초기화
            this.setState({
                searchResults: [],
                searchLoading: false,
                searchError: null,
                hasPerformedSearch: false // 검색 수행 여부도 초기화
            });
            return;
        }

        this.setState({ searchLoading: true, searchError: null, hasPerformedSearch: true });
        try {
            const params = new URLSearchParams();
            params.append('keyword', trimmedQuery);
            // 백엔드 API /api/festivals 엔드포인트 호출
            const response = await axios.get(`${API_BASE_URL}/api/festivals?${params.toString()}`);
            const festivalsData = response.data.festivals || [];
            this.setState({ searchResults: festivalsData, searchLoading: false });

            // 로그인 상태이고 검색어가 있다면 최근 검색어에 추가
            if (this.state.isLoggedIn && this.state.userName && trimmedQuery) {
                this.addRecentSearch(trimmedQuery);
            }
        } catch (err) {
            console.error("Search API error:", err.response ? err.response.data : err.message);
            this.setState({ searchError: t('error_searching'), searchResults: [], searchLoading: false });
        }
    };

    // 검색 폼 제출
    handleSearchSubmit = (e) => {
        e.preventDefault();
        this.executeSearch(this.state.searchQuery);
        if (this.searchInputRef.current) {
            this.searchInputRef.current.blur(); // 검색 후 입력창 포커스 해제
        }
    };

    // 검색 결과 항목 클릭 시 (상세 페이지 이동 등)
    handleResultItemClick = (festival) => {
        if (this.props.onClose) {
            this.props.onClose(); // 오버레이 닫기
        }
        // TODO: 축제 상세 페이지로 이동하는 로직 추가
        // 예: this.props.navigate(`/festivals/${festival.id}`);
        // 현재 App.js에서 SearchOverlay를 사용하므로 navigate prop을 직접 전달해야 함
        // 아니면 Link 컴포넌트를 사용하고 외부에서 useNavigate 훅을 받아와야 함
        console.log("Festival clicked:", festival);
    };

    render() {
        const { t } = this.props;
        if (!this.props.isOpen) {
            return null;
        }

        const {
            searchQuery, searchResults, searchLoading, searchError, hasPerformedSearch, recentSearches, isLoggedIn
        } = this.state;

        // 최근 검색어 섹션 표시 여부
        const showRecentSearches = isLoggedIn && recentSearches.length > 0 && searchQuery.trim() === "" && !searchLoading && !searchError && !hasPerformedSearch;
        // 검색 결과 없음 메시지 표시 여부
        const showNoResultsMessage = !searchLoading && !searchError && hasPerformedSearch && searchQuery.trim() !== "" && searchResults.length === 0;

        return (
            <div className="search-overlay-backdrop" onClick={this.props.onClose}>
                <div className="search-overlay-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button" onClick={this.props.onClose} aria-label={t('close_overlay_aria_label')}>×</button>

                    <div className="search-overlay-header">
                        <form onSubmit={this.handleSearchSubmit} className="search-overlay-form">
                            <input
                                ref={this.searchInputRef}
                                type="search"
                                className="search-overlay-input"
                                placeholder={t('search_placeholder_overlay')}
                                value={searchQuery}
                                onChange={this.handleSearchInputChange}
                                aria-label={t('search_input_aria_label')}
                            />
                            <button type="submit" className="search-overlay-button" aria-label={t('execute_search_aria_label')}>{t('search_button_text')}</button>
                        </form>
                    </div>

                    {/* 검색 결과 없음 메시지 */}
                    {showNoResultsMessage && (
                        <p className="message-feedback info">{t('no_results_for_query', { query: searchQuery })}</p>
                    )}

                    {/* 최근 검색어 섹션 (로그인 상태, 검색어 입력 안 했을 때만 표시) */}
                    {showRecentSearches && (
                        <div className="search-overlay-recent-searches">
                            <div className="recent-searches-header">
                                <h4>{t('recent_searches')}</h4>
                                {recentSearches.length > 0 && (
                                    <button onClick={this.handleClearAllRecentSearches} className="clear-all-button">
                                        {t('clear_all')}
                                    </button>
                                )}
                            </div>
                            <ul>
                                {/* key prop 수정: term 자체를 사용 */}
                                {recentSearches.map((term) => (
                                    <li key={term} onClick={() => this.handleRecentSearchClick(term)} title={t('search_with_term_title', { term: term })}>
                                        <span>{term}</span>
                                        <button
                                            className="delete-button"
                                            onClick={(e) => this.deleteRecentSearch(term, e)}
                                            aria-label={t('delete_recent_search_aria_label', { term: term })}
                                        >×</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* 검색 로딩, 에러, 결과 표시 영역 */}
                    {(searchLoading || searchError || (hasPerformedSearch && searchResults.length > 0)) && (
                        <div className="search-overlay-results-area">
                            {searchLoading && <p className="message-feedback loading">{t('loading_results')}</p>}
                            {searchError && <p className="message-feedback error">{t('error_searching')}</p>}

                            {!searchLoading && !searchError && searchResults.length > 0 && (
                                <>
                                    <h3>{t('search_results_count', { query: searchQuery, count: searchResults.length })}</h3>
                                    <div className="results-list">
                                        {searchResults.map((festival) => (
                                            // key prop 수정: festival.resource가 가장 고유한 값. 없다면 festival.name과 Math.random() 조합.
                                            <div className="result-item" key={festival.resource || `${festival.name}-${Math.random()}`} onClick={() => this.handleResultItemClick(festival)}>
                                                <h4>{festival.name || t('no_name_info')}</h4> {/* '축제명' 대신 'name' 사용 */}
                                                {festival.address && <p className="location">📍 {festival.address}</p>} {/* '개최장소' 대신 'address' 사용 */}
                                                {(festival.startDate && festival.endDate) &&
                                                    <p className="date">📅 {festival.startDate} ~ {festival.endDate}</p>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default withTranslation()(SearchOverlay);
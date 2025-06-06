// frontend/src/components/Login.jsx
import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import "../login.css";
import axios from "axios";
import NavBar from "./NavBar"; // NavBar는 App.js에서 렌더링되므로, Login 컴포넌트 자체에는 직접 포함하지 않아도 됨
import { withTranslation } from 'react-i18next'; // HOC 추가

// .env 파일에서 백엔드 API URL을 가져오거나 기본값 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            redirectToHome: false,
        };
    }

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleLogin = (e) => {
        e.preventDefault();
        const { username, password } = this.state;
        const { t } = this.props;

        if (!username.trim() || !password.trim()) {
            alert(t('login_alert_fill_all', '아이디와 비밀번호를 모두 입력해주세요.'));
            return;
        }

        axios
            .post(`${API_BASE_URL}/login`, { username, password })
            .then((res) => {
                if (res.data.result === "success") {
                    alert(t('login_success', '로그인 성공!'));
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("userName", res.data.userName); // 사용자 아이디 (로그인 아이디)
                    localStorage.setItem("isLoggedIn", "true"); // 로그인 상태를 localStorage에 저장

                    if (res.data.name) {
                        localStorage.setItem("name", res.data.name); // 사용자의 실제 이름
                    }
                    if (res.data.interests && Array.isArray(res.data.interests)) {
                        localStorage.setItem("interests", JSON.stringify(res.data.interests));
                    } else {
                        localStorage.setItem("interests", JSON.stringify([]));
                    }

                    if (res.data.userRegion) {
                        localStorage.setItem("userRegion", res.data.userRegion); // 사용자 거주 지역
                    } else {
                        localStorage.removeItem("userRegion");
                        console.warn("로그인 응답에 userRegion이 포함되지 않았습니다. 백엔드를 확인하세요.");
                    }

                    // ✨✨ 이 부분이 핵심: userId (DB의 member.id)를 localStorage에 저장 ✨✨
                    if (res.data.userId) { // 백엔드에서 userId가 반환된다고 가정
                        localStorage.setItem("userId", res.data.userId);
                    } else {
                        console.warn("로그인 응답에 userId가 포함되지 않았습니다. 백엔드를 확인하세요.");
                    }

                    this.setState({ redirectToHome: true });
                } else {
                    alert(t('login_alert_failed', { message: (res.data.message || t('login_alert_failed_default', '로그인에 실패했습니다.')) }));
                }
            })
            .catch((err) => {
                console.error("Login API error:", err);
                let errorMessage = t('login_alert_error', '로그인 중 오류가 발생했습니다.');
                if (err.response && err.response.data) {
                    errorMessage = err.response.data.error || err.response.data.message || errorMessage;
                } else if (err.request) {
                    errorMessage = t('login_alert_server_no_response', '서버에서 응답이 없습니다.');
                }
                alert(errorMessage);
            });
    };

    render() {
        const { t } = this.props; // t 함수는 withTranslation HOC를 통해 props로 전달됨

        if (this.state.redirectToHome) {
            return <Navigate to="/" replace />;
        }

        return (
            // NavBar는 App.js에서 전역적으로 렌더링되므로, Login 컴포넌트 내부에서 다시 렌더링할 필요 없음.
            // <NavBar toggleSearchOverlay={this.props.toggleSearchOverlay} /> 이 줄은 제거합니다.

            <div className="login-body">
                <div className="login-container">
                    <h2 className="login-title">{t('login_title', '로그인')}</h2>
                    <form onSubmit={this.handleLogin} className="login-form">
                        <div className="form-group">
                            <input
                                type="text"
                                name="username"
                                placeholder={t('login_id_placeholder', '아이디를 입력하세요')}
                                value={this.state.username}
                                onChange={this.handleInputChange}
                                className="form-input"
                                required
                                autoComplete="username"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                name="password"
                                placeholder={t('login_password_placeholder', '비밀번호를 입력하세요')}
                                value={this.state.password}
                                onChange={this.handleInputChange}
                                className="form-input"
                                required
                                autoComplete="current-password"
                            />
                        </div>
                        <button type="submit" className="login-button">{t('login_button', '로그인')}</button>
                    </form>

                    <div className="social-login">
                        <p className="social-title">{t('login_simple_login_title', '간편 로그인')}</p>
                        <div className="social-icons">
                            <a href="#!" onClick={(e) => { e.preventDefault(); alert(t('naver_login_coming_soon', '네이버 로그인 기능은 준비중입니다.')); }} className="social-icon-link">
                                <img src="/images/naver.png" alt={t('login_naver_alt', '네이버 로그인')} className="social-icon" />
                            </a>
                            <a href="#!" onClick={(e) => { e.preventDefault(); alert(t('kakao_login_coming_soon', '카카오 로그인 기능은 준비중입니다.')); }} className="social-icon-link">
                                <img src="/images/kakao-talk.png" alt={t('login_kakao_alt', '카카오 로그인')} className="social-icon" />
                            </a>
                        </div>
                    </div>

                    <div className="login-links" style={{ marginTop: '20px', textAlign: 'center' }}>
                        <Link to="/signup" className="link" style={{ marginRight: '20px' }}>{t('nav_signup', '회원가입')}</Link>
                        <Link to="/find-account" className="link">{t('nav_find_account', '아이디/비밀번호 찾기')}</Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation()(Login); // withTranslation으로 감싸기
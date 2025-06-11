// frontend/src/components/Register.jsx
import React, { Component } from "react";
import '../register.css'; // 또는 login.css 공유 시 ../login.css
import axios from "axios";
import { Navigate, Link } from "react-router-dom";
import { withTranslation } from 'react-i18next';
import i18n from '../i18n';
const API_BASE_URL = process.env.REACT_APP_API_URL;

// 관심사 목록
const interestOptions = ["음악", "음식", "전통문화", "연극", "야시장", "전통", "야간", "콘서트", "한복"];

// 지역 선택 옵션 (RegionsListPage.jsx 또는 festival.jsx의 allProvinces 참고)
const regionOptions = [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시",
    "울산광역시", "세종특별자치시", "경기도", "강원특별자치도", "충청북도", "충청남도",
    "전북특별자치도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
];

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            phoneNumber: '',
            username: '',
            password: '',
            confirmPassword: '',
            interests: [],
            region: '', // 거주 지역 상태 추가
            nameError: '',
            phoneNumberError: '',
            passwordError: '',
            regionError: '', // 지역 선택 에러 메시지 상태 추가
            registrationSuccess: false,
        };
    }

    handleInterestChange = (e) => {
        const { value, checked } = e.target;
        this.setState(prevState => {
            const newInterests = checked
                ? [...prevState.interests, value]
                : prevState.interests.filter(item => item !== value);
            return { interests: newInterests };
        });
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        const { t } = this.props;

        this.setState({ [name]: value }, () => {
            if (name === "name") {
                const nameRegex = /^[가-힣]{2,}$/;
                if (value.trim() && !nameRegex.test(value.trim()) && i18n.language === 'ko') {
                    this.setState({ nameError: t('validate_name_format') });
                } else if (!value.trim()) {
                    this.setState({ nameError: t('validate_name_empty') });
                } else {
                    this.setState({ nameError: "" });
                }
            }
            if (name === "phoneNumber") {
                const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
                if (value.trim() && !phoneRegex.test(value.trim())) {
                    this.setState({ phoneNumberError: t('validate_phone_format') });
                } else {
                    this.setState({ phoneNumberError: "" });
                }
            }
            if (name === "password" || name === "confirmPassword") {
                const { password, confirmPassword } = this.state;
                if (password && confirmPassword && password !== confirmPassword) {
                    this.setState({ passwordError: t('validate_password_mismatch') });
                } else {
                    this.setState({ passwordError: "" });
                }
            }
            if (name === "region") { // 지역 유효성 검사 (선택 여부)
                if (!value) {
                    this.setState({ regionError: t('validate_region_empty', '거주 지역을 선택해주세요.') });
                } else {
                    this.setState({ regionError: "" });
                }
            }
        });
    }

    callRegisterAPI = () => {
        const { name, phoneNumber, username, password, interests, region } = this.state; // region 추가
        const userData = {
            name: name.trim(),
            phoneNumber: phoneNumber.trim(),
            username: username.trim(),
            password: password,
            interests: interests,
            region: region // API로 전송할 데이터에 region 추가
        };
        return axios.post(`${API_BASE_URL}/reg_ok`, userData);
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { t } = this.props;
        const { name, phoneNumber, username, password, confirmPassword, interests, region, // region 추가
            nameError, phoneNumberError, passwordError, regionError } = this.state; // regionError 추가

        console.log("ㅁㄴㅇㄻㄴㅇㄻㄴㅇㄹRegister handleSubmit - Region to be sent:", region);

        // 필수 필드 검사
        if (!name.trim() || !phoneNumber.trim() || !username.trim() || !password || !confirmPassword || !region) { // region 필수 체크 추가
            alert(t('register_alert_fill_all_extended', '모든 필수 정보를 입력하고 거주 지역을 선택해주세요.'));
            // 지역 필드에 대한 에러 처리도 강화
            if (!region) this.setState({ regionError: t('validate_region_empty', '거주 지역을 선택해주세요.') });
            return;
        }
        if (nameError || phoneNumberError || passwordError || regionError) { // regionError 체크 추가
            alert(t('register_alert_check_format'));
            return;
        }
        if (interests.length === 0) {
            alert(t('register_alert_select_interest'));
            return;
        }

        this.callRegisterAPI()
            .then((response) => {
                if (response.data && response.data.result === 'success') {
                    alert(t('register_alert_success'));
                    this.setState({ registrationSuccess: true });
                } else {
                    const errorMessage = response.data?.message || response.data?.error || 'Unknown registration failure';
                    alert(t('register_alert_failed', { message: errorMessage }));
                }
            })
            .catch((error) => {
                console.error("Registration API call error:", error.response || error.message);
                let alertMessage = t('register_alert_error');
                if (error.response && error.response.data) {
                    alertMessage = t('register_alert_failed', {
                        message: (error.response.data.error || error.response.data.message || 'Server response error')
                    });
                }
                alert(alertMessage);
            });
    }

    render() {
        const { t } = this.props;

        if (this.state.registrationSuccess) {
            return <Navigate to="/login" replace />;
        }

        return (
            <>
                <div className="login-body"> {/* login.css 또는 register.css 사용 */}
                    <div className="login-container"> {/* login.css 또는 register.css 사용 */}
                        <h2>{t('register_title')}</h2>
                        <form onSubmit={this.handleSubmit}>
                            {/* 이름, 전화번호, 아이디, 비밀번호, 비밀번호 확인 입력 필드는 기존과 동일 */}
                            <div className="input-group">
                                <label htmlFor="name">{t('register_name_label')}</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder={t('register_name_placeholder')}
                                    value={this.state.name}
                                    onChange={this.handleInputChange}
                                    required
                                />
                                {this.state.nameError && (
                                    <p className="error-message" style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                                        {this.state.nameError}
                                    </p>
                                )}
                            </div>

                            <div className="input-group">
                                <label htmlFor="phoneNumber">{t('register_phone_label')}</label>
                                <input
                                    type="text"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    placeholder={t('register_phone_placeholder')}
                                    value={this.state.phoneNumber}
                                    onChange={this.handleInputChange}
                                    title={t('validate_phone_format')}
                                    required
                                />
                                {this.state.phoneNumberError && (
                                    <p className="error-message" style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                                        {this.state.phoneNumberError}
                                    </p>
                                )}
                            </div>

                            <div className="input-group">
                                <label htmlFor="username">{t('register_id_label')}</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder={t('register_id_placeholder')}
                                    value={this.state.username}
                                    onChange={this.handleInputChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="password">{t('register_password_label')}</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder={t('register_password_placeholder')}
                                    value={this.state.password}
                                    onChange={this.handleInputChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="confirmPassword">{t('register_confirm_password_label')}</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder={t('register_confirm_password_placeholder')}
                                    value={this.state.confirmPassword}
                                    onChange={this.handleInputChange}
                                    required
                                />
                                {this.state.passwordError && (
                                    <p className="error-message" style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                                        {this.state.passwordError}
                                    </p>
                                )}
                            </div>

                            {/* 거주 지역 선택 드롭다운 추가 */}
                            <div className="input-group">
                                <label htmlFor="region">{t('register_region_label', '거주 지역')}</label>
                                <select
                                    id="region"
                                    name="region"
                                    value={this.state.region}
                                    onChange={this.handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                                >
                                    <option value="">{t('register_region_placeholder', '-- 지역 선택 --')}</option>
                                    {regionOptions.map(option => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                {this.state.regionError && (
                                    <p className="error-message" style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                                        {this.state.regionError}
                                    </p>
                                )}
                            </div>

                            {/* 관심사 선택 부분은 기존과 동일 */}
                            <div className="input-group">
                                <label>{t('register_interests_label')}</label>
                                <div className="interest-checkboxes">
                                    {interestOptions.map((interest, index) => (
                                        <label key={index} className="interest-label" style={{ marginRight: '15px', display: 'inline-block' }}>
                                            <input
                                                type="checkbox"
                                                value={interest}
                                                checked={this.state.interests.includes(interest)}
                                                onChange={this.handleInterestChange}
                                                style={{ marginRight: '5px' }}
                                            />
                                            {interest}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <input type="submit" value={t('register_button')} className="btn-login" />
                        </form>
                        <Link className="link" to="/login" style={{ marginTop: '15px', display: 'inline-block' }}>{t('register_go_back_link')}</Link>
                    </div>
                </div>
            </>
        );
    }
}

const TranslatedRegister = withTranslation()(Register);
export default TranslatedRegister;
// frontend/src/components/FindAccount.jsx
import React, { Component } from 'react';
import axios from 'axios';
import '../login.css';
import { Link, useNavigate } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class FindAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'findId',
            // 아이디 찾기 상태
            nameForId: '',
            phoneNumberForId: '',
            foundId: '',
            findIdMessage: '',
            nameErrorForId: '',
            phoneErrorForId: '',
            // 비밀번호 재설정 상태
            usernameForPw: '',
            phoneNumberForPw: '',
            phoneErrorForPw: '',
            isVerifiedForPw: false, // 사용자 확인 여부
            newPassword: '',
            confirmNewPassword: '',
            findPwMessage: '',
        };
    }

    // 탭 변경 시 상태 초기화
    handleTabChange = (tab) => {
        this.setState({
            activeTab: tab,
            nameForId: '', phoneNumberForId: '', foundId: '', findIdMessage: '', nameErrorForId: '', phoneErrorForId: '',
            usernameForPw: '', phoneNumberForPw: '', phoneErrorForPw: '', isVerifiedForPw: false, newPassword: '', confirmNewPassword: '', findPwMessage: ''
        });
    };

    // 입력값 변경 핸들러
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    // 아이디 찾기 핸들러
    handleFindId = async (e) => {
        e.preventDefault();
        const { nameForId, phoneNumberForId } = this.state;
        const { t } = this.props;
        try {
            const response = await axios.post(`${API_BASE_URL}/api/find-id`, { name: nameForId, phoneNumber: phoneNumberForId });
            this.setState({ foundId: response.data.username, findIdMessage: t('find_id_found_message') });
        } catch (error) {
            this.setState({ foundId: '', findIdMessage: error.response?.data?.message || t('find_id_error_message') });
        }
    };

    // 비밀번호 재설정을 위한 사용자 확인 핸들러
    handleVerifyUserForPw = async (e) => {
        e.preventDefault();
        const { usernameForPw, phoneNumberForPw } = this.state;
        const { t } = this.props;
        this.setState({ findPwMessage: '' });

        if (!usernameForPw || !phoneNumberForPw) {
            this.setState({ findPwMessage: t('find_pw_enter_all_fields', '아이디와 전화번호를 모두 입력해주세요.') });
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/verify-user-for-reset`, { username: usernameForPw, phoneNumber: phoneNumberForPw });
            if (response.data.success) {
                this.setState({ isVerifiedForPw: true, findPwMessage: '' }); // 확인 성공 시, 상태 변경
            }
        } catch (error) {
            this.setState({ findPwMessage: error.response?.data?.message || t('find_pw_verification_fail', '사용자 확인에 실패했습니다.') });
        }
    };

    // 새로운 비밀번호 설정 핸들러
    handleResetPassword = async (e) => {
        e.preventDefault();
        const { usernameForPw, newPassword, confirmNewPassword } = this.state;
        const { t } = this.props;

        if (!newPassword || !confirmNewPassword) {
            this.setState({ findPwMessage: t('find_pw_enter_new_passwords', '새로운 비밀번호와 확인을 모두 입력해주세요.') });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            this.setState({ findPwMessage: t('password_mismatch', '새로운 비밀번호가 일치하지 않습니다.') });
            return;
        }
        if (newPassword.length < 6) {
            this.setState({ findPwMessage: t('password_too_short', '새로운 비밀번호는 최소 6자 이상이어야 합니다.') });
            return;
        }

        try {
            const response = await axios.put(`${API_BASE_URL}/api/reset-password`, { username: usernameForPw, newPassword });
            alert(response.data.message); // 성공 메시지 alert
            this.props.navigate('/login'); // 로그인 페이지로 이동
        } catch (error) {
            this.setState({ findPwMessage: error.response?.data?.message || t('find_pw_reset_fail', '비밀번호 재설정에 실패했습니다.') });
        }
    };

    // 아이디 찾기 폼 렌더링
    renderFindIdForm() {
        const { t } = this.props;
        const { nameForId, phoneNumberForId, findIdMessage, foundId } = this.state;
        return (
            <form onSubmit={this.handleFindId}>
                <div className="input-group">
                    <label>{t('find_account_name_label')}</label>
                    <input type="text" name="nameForId" value={nameForId} onChange={this.handleChange} placeholder={t('find_account_name_placeholder')} required />
                </div>
                <div className="input-group">
                    <label>{t('find_account_phone_label')}</label>
                    <input type="text" name="phoneNumberForId" value={phoneNumberForId} onChange={this.handleChange} placeholder={t('find_account_phone_placeholder')} required />
                </div>
                <button type="submit" className="btn-login">{t('find_id_button')}</button>
                {findIdMessage && (
                    <p className={`find-result-message ${foundId ? 'success' : 'error'}`}>
                        {findIdMessage} {foundId && <strong>{foundId}</strong>}
                    </p>
                )}
            </form>
        );
    }

    // 비밀번호 찾기(재설정) 폼 렌더링
    renderFindPasswordForm() {
        const { t } = this.props;
        const { isVerifiedForPw, usernameForPw, phoneNumberForPw, newPassword, confirmNewPassword, findPwMessage } = this.state;

        // 1단계: 사용자 확인 폼
        if (!isVerifiedForPw) {
            return (
                <form onSubmit={this.handleVerifyUserForPw}>
                    <p className="form-description">{t('find_pw_verification_desc', '비밀번호를 재설정하기 위해 아이디와 전화번호를 입력해주세요.')}</p>
                    <div className="input-group">
                        <label>{t('find_account_id_label')}</label>
                        <input type="text" name="usernameForPw" value={usernameForPw} onChange={this.handleChange} placeholder={t('find_account_id_placeholder')} required />
                    </div>
                    <div className="input-group">
                        <label>{t('find_account_phone_label')}</label>
                        <input type="text" name="phoneNumberForPw" value={phoneNumberForPw} onChange={this.handleChange} placeholder={t('find_account_phone_placeholder')} required />
                    </div>
                    <button type="submit" className="btn-login">{t('find_pw_verify_button', '사용자 확인')}</button>
                    {findPwMessage && <p className="find-result-message error">{findPwMessage}</p>}
                </form>
            );
        }

        // 2단계: 새 비밀번호 입력 폼
        return (
            <form onSubmit={this.handleResetPassword}>
                <p className="form-description">{t('find_pw_reset_desc', '새로운 비밀번호를 입력해주세요.')}</p>
                <div className="input-group">
                    <label>{t('new_password_label', '새로운 비밀번호')}</label>
                    <input type="password" name="newPassword" value={newPassword} onChange={this.handleChange} required />
                </div>
                <div className="input-group">
                    <label>{t('confirm_new_password_label', '새로운 비밀번호 확인')}</label>
                    <input type="password" name="confirmNewPassword" value={confirmNewPassword} onChange={this.handleChange} required />
                </div>
                <button type="submit" className="btn-login">{t('find_pw_reset_button', '비밀번호 재설정')}</button>
                {findPwMessage && <p className="find-result-message error">{findPwMessage}</p>}
            </form>
        );
    }

    render() {
        const { activeTab } = this.state;
        const { t } = this.props;
        return (
            <div className="login-body">
                <div className="login-container" style={{ minHeight: '520px' }}>
                    <h2>{t('find_account_title')}</h2>
                    <div className="find-account-tabs">
                        <button onClick={() => this.handleTabChange('findId')} className={`tab-btn ${activeTab === 'findId' ? 'active' : ''}`}>{t('find_id_tab')}</button>
                        <button onClick={() => this.handleTabChange('findPw')} className={`tab-btn ${activeTab === 'findPw' ? 'active' : ''}`}>{t('find_password_tab')}</button>
                    </div>

                    {activeTab === 'findId' ? this.renderFindIdForm() : this.renderFindPasswordForm()}

                    <div className="extra-links">
                        <Link className="link" to="/login">{t('find_account_go_to_login_link')}</Link>
                    </div>
                </div>
            </div>
        );
    }
}

// React Router v6에서는 HOC로 감싼 컴포넌트에 navigate 함수를 직접 전달할 수 없으므로,
// 래퍼 컴포넌트를 만들어 props로 전달해줍니다.
function FindAccountWithNavigate(props) {
    let navigate = useNavigate();
    return <FindAccount {...props} navigate={navigate} />
}

export default withTranslation()(FindAccountWithNavigate);
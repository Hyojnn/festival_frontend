// frontend/src/components/WritePostPage.jsx

import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import '../communityPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// 백엔드 ADMIN_USERNAME과 동일해야 합니다.
const FRONTEND_ADMIN_USERNAME = 'admin';

class WritePostPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            content: '',
            category: '자유', // 기본 카테고리를 '자유'로 설정
            image: null,
            imageUrlPreview: '',
            isSubmitting: false,
            loggedInUserName: localStorage.getItem('userName') || '',
            token: localStorage.getItem('token') || ''
        };
        this.navigate = this.props.navigate;
    }

    componentDidMount() {
        if (!this.state.loggedInUserName || !this.state.token) {
            alert(this.props.t('login_required_to_write', '로그인이 필요합니다.'));
            this.navigate('/login');
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            this.setState({
                image: file,
                imageUrlPreview: URL.createObjectURL(file)
            });
        } else {
            this.setState({
                image: null,
                imageUrlPreview: ''
            });
        }
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { t } = this.props;
        const { title, content, category, image, loggedInUserName, token } = this.state;

        if (!loggedInUserName || !token) {
            alert(t('login_required_to_write', '로그인이 필요합니다.'));
            this.navigate('/login');
            return;
        }

        if (!title.trim() || !content.trim()) {
            alert(t('write_post_alert_fill_all', '제목과 내용을 모두 입력해주세요.'));
            return;
        }

        this.setState({ isSubmitting: true });

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        formData.append('category', category);
        formData.append('author', loggedInUserName);
        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/posts`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });

            alert(t('write_post_alert_success', '게시글이 성공적으로 작성되었습니다!'));
            this.navigate(`/community/post/${response.data.postId}`);
        } catch (error) {
            console.error("게시글 작성 실패:", error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data?.error || error.message;
            alert(t('write_post_alert_fail', `게시글 작성에 실패했습니다. 상세: ${errorMessage}`));
        } finally {
            this.setState({ isSubmitting: false });
        }
    };

    handleCancel = () => {
        if (window.confirm(this.props.t('write_post_alert_cancel', '작성을 취소하시겠습니까? 작성 중인 내용은 저장되지 않습니다.'))) {
            this.navigate('/community');
        }
    };

    render() {
        const { t } = this.props;
        const { title, content, category, imageUrlPreview, isSubmitting, loggedInUserName } = this.state;

        // 현재 로그인된 사용자가 관리자인지 확인
        const isAdmin = loggedInUserName === FRONTEND_ADMIN_USERNAME;

        return (
            <div className="community-page-container vibrant-theme">
                <div className="write-post-header">
                    <h1>{t('write_post_title', '새 게시글 작성')}</h1>
                    <p>{t('write_post_description', '축제 경험과 꿀팁을 공유해주세요.')}</p>
                </div>

                <form className="write-post-form" onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="category">{t('write_post_category_label', '카테고리')}</label>
                        <select
                            id="category"
                            name="category"
                            value={category}
                            onChange={this.handleInputChange}
                            disabled={isSubmitting}
                        >
                            <option value="자유">{t('community_category_free', '자유 게시판')}</option>
                            <option value="꿀팁">{t('community_type_tip', '꿀팁')}</option>
                            {/* 관리자인 경우에만 '공지' 옵션 표시 */}
                            {isAdmin && <option value="공지">{t('community_category_notice', '공지')}</option>}
                            {/* '리뷰'와 '사진' 옵션은 제거 */}
                            {/* <option value="리뷰">{t('community_type_review', '리뷰')}</option> */}
                            {/* <option value="사진">{t('community_type_photo', '사진')}</option> */}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">{t('write_post_title_label', '제목')}</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={title}
                            onChange={this.handleInputChange}
                            placeholder={t('write_post_title_placeholder', '게시글 제목을 입력하세요')}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">{t('write_post_content_label', '내용')}</label>
                        <textarea
                            id="content"
                            name="content"
                            value={content}
                            onChange={this.handleInputChange}
                            placeholder={t('write_post_content_placeholder', '내용을 작성하세요.')}
                            rows="10"
                            required
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">{t('write_post_image_label', '이미지 첨부 (선택)')}</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={this.handleImageChange}
                            disabled={isSubmitting}
                        />
                        {imageUrlPreview && (
                            <div className="image-preview-container" style={{ marginTop: '15px' }}>
                                <img src={imageUrlPreview} alt="첨부 이미지 미리보기" style={{ maxWidth: '200px', height: 'auto', borderRadius: '5px' }} />
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                            {isSubmitting ? t('submitting', '제출 중...') : <><FaPaperPlane /> {t('submit_post', '게시글 작성')}</>}
                        </button>
                        <button type="button" className="cancel-button" onClick={this.handleCancel} disabled={isSubmitting}>
                            <FaTimes /> {t('cancel', '취소')}
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}

const WritePostPageWithNavigate = (props) => {
    const navigate = useNavigate();
    return <WritePostPage {...props} navigate={navigate} />;
};

export default withTranslation()(WritePostPageWithNavigate);
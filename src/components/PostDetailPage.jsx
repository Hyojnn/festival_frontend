// frontend/src/components/PostDetailPage.jsx (풀 코드)

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { FaUserCircle, FaCalendarAlt, FaHeart, FaCommentAlt, FaArrowLeft, FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';
import '../communityPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PostDetailPage({ t }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false); // ✨ 사용자가 이 게시물에 좋아요를 눌렀는지 여부

    useEffect(() => {
        const userName = localStorage.getItem('userName');
        const userId = localStorage.getItem('userId'); // 로그인 시 member.id를 저장했다고 가정
        if (userName && userId) {
            setCurrentUser({ username: userName, id: userId });
        }

        const fetchPost = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/posts/${id}`);
                setPost(response.data);
                setLikes(response.data.likes || 0);

                // ✨ 게시글 로드 후, 현재 사용자가 이 게시물에 좋아요를 눌렀는지 확인하는 API 호출
                // 이 부분이 정확하려면 백엔드에 별도의 API가 필요합니다.
                // 임시로 클라이언트에서 직접 체크하는 로직 (정확하지 않을 수 있음)
                // 실제 구현 시: `GET /api/posts/:id/liked_status` 와 같은 API 필요
                if (userName && userId) { // 로그인 상태일 때만 체크
                    try {
                        const token = localStorage.getItem('token');
                        const likedStatusResponse = await axios.get(`${API_BASE_URL}/api/posts/${id}/liked_status`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setHasLiked(likedStatusResponse.data.hasLiked);
                    } catch (checkErr) {
                        console.warn("좋아요 상태 확인 실패 (isLikedStatus):", checkErr.response?.data?.error || checkErr.message);
                        setHasLiked(false); // 오류 발생 시 좋아요 안 누른 것으로 간주
                    }
                }

            } catch (err) {
                console.error("게시글 불러오기 실패:", err.response ? err.response.data : err.message);
                setError(t('post_load_fail', '게시글을 불러오는 데 실패했습니다.'));
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, t]);

    const handleDelete = async () => {
        if (!window.confirm(t('confirm_delete_post', '정말로 이 게시글을 삭제하시겠습니까?'))) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert(t('login_required_to_delete', '로그인이 필요합니다.'));
            navigate('/login');
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/api/posts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(t('post_delete_success', '게시글이 성공적으로 삭제되었습니다.'));
            navigate('/community/posts');
        } catch (err) {
            console.error("게시글 삭제 실패:", err.response ? err.response.data : err.message);
            const errorMessage = err.response?.status === 403
                ? t('not_author_delete_permission', '본인이 작성한 게시글만 삭제할 수 있습니다.')
                : t('post_delete_fail', `게시글 삭제에 실패했습니다: ${err.response?.data?.error || err.message}`);
            alert(errorMessage);
        }
    };

    const handleLike = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert(t('login_required_to_like', '좋아요를 누르려면 로그인이 필요합니다.'));
            navigate('/login');
            return;
        }

        // ✨ 좋아요 버튼 비활성화 로직 (클라이언트 측 1차 검증)
        // isAuthor 조건과 hasLiked 조건 모두 만족하면 비활성화
        if (isAuthor || hasLiked) {
            // 이 메시지는 alert로 띄우지 않고, 버튼의 disabled 속성으로만 제어하는 것이 더 사용자 친화적입니다.
            // alert(isAuthor ? t('cannot_like_own_post', '본인이 작성한 글에는 좋아요를 누를 수 없습니다.') : t('already_liked', '이미 좋아요를 누르셨습니다.'));
            return;
        }


        try {
            const response = await axios.post(`${API_BASE_URL}/api/posts/${id}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLikes(response.data.newLikes);
            setHasLiked(true); // ✨ 좋아요 성공 시 hasLiked 상태를 true로 변경
            alert(t('like_success', '좋아요가 반영되었습니다.'));
        } catch (err) {
            console.error("좋아요 실패:", err.response ? err.response.data : err.message);
            let errorMessage = t('like_fail', `좋아요 처리 중 오류가 발생했습니다: ${err.response?.data?.error || err.message}`);

            if (err.response) {
                if (err.response.status === 403 && err.response.data.error === '본인이 작성한 글에는 좋아요를 누를 수 없습니다.') {
                    errorMessage = t('cannot_like_own_post', '본인이 작성한 글에는 좋아요를 누를 수 없습니다.');
                } else if (err.response.status === 409 && err.response.data.error === '이미 이 게시물에 좋아요를 눌렀습니다.') {
                    errorMessage = t('already_liked', '이미 좋아요를 누르셨습니다.');
                    setHasLiked(true); // 혹시 모를 상황 대비하여 hasLiked를 true로 강제 설정
                } else if (err.response.status === 401) {
                    errorMessage = t('token_expired_relogin', '토큰이 만료되었습니다. 다시 로그인 해주세요.');
                    navigate('/login');
                } else if (err.response.status === 403) {
                    errorMessage = t('like_auth_fail', '좋아요 권한이 없습니다.');
                }
            }
            alert(errorMessage);
        }
    };


    if (loading) return <div className="community-page-container"><p>{t('loading_post', '게시글을 불러오는 중...')}</p></div>;
    if (error) return <div className="community-page-container"><p className="error-message">{error}</p></div>;
    if (!post) return <div className="community-page-container"><p>{t('post_not_found', '게시글을 찾을 수 없습니다.')}</p></div>;

    const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '') : '';

    // 게시글 작성자와 현재 로그인된 사용자가 일치하는지 확인
    const isAuthor = currentUser && post.author === currentUser.username;

    // 좋아요 버튼 비활성화 여부 결정: 작성자 본인이거나 이미 좋아요를 눌렀으면 비활성화
    const isLikeButtonDisabled = isAuthor || hasLiked;


    return (
        <div className="community-page-container vibrant-theme">
            <div className="post-detail-header">
                <Link to="/community/posts" className="back-button">
                    <FaArrowLeft /> {t('back_to_community', '모든 게시글로 돌아가기')}
                </Link>
                <h1>{t('post_detail_title', '게시글 상세')}</h1>
            </div>

            <div className="post-detail-card">
                <h2>{post.title}</h2>
                <div className="post-meta-detail">
                    <span className="meta-author"><FaUserCircle /> {post.author}</span>
                    <span className="meta-date"><FaCalendarAlt /> {formattedDate}</span>
                    <span className="meta-likes"><FaHeart /> {likes}</span>
                    <span className="meta-comments"><FaCommentAlt /> {post.comments || 0}</span>
                    <span className="meta-type-badge">{post.category}</span>
                    {isAuthor && (
                        <button onClick={handleDelete} className="delete-post-button" style={{
                            marginLeft: 'auto',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            padding: '8px 15px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            <FaTrashAlt /> {t('delete_post', '삭제')}
                        </button>
                    )}
                </div>
                <div className="post-content-detail">
                    {post.imageUrl && (
                        <div className="post-image-container" style={{ marginBottom: '20px', textAlign: 'center' }}>
                            <img
                                src={`${API_BASE_URL}${post.imageUrl}`}
                                alt={post.title}
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                            />
                        </div>
                    )}
                    <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
                </div>

                <div className="post-actions-bottom" style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button
                        onClick={handleLike}
                        className="like-button"
                        disabled={isLikeButtonDisabled} // ✨ 비활성화 여부 상태 변수 사용
                        style={{
                            backgroundColor: isLikeButtonDisabled ? '#cccccc' : '#FF5722',
                            color: 'white',
                            border: 'none',
                            borderRadius: '25px',
                            padding: '12px 25px',
                            fontSize: '1.1em',
                            fontWeight: '600',
                            cursor: isLikeButtonDisabled ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: isLikeButtonDisabled ? 'none' : '0 4px 10px rgba(255, 87, 34, 0.2)'
                        }}
                    >
                        <FaHeart /> {t('like_button', '좋아요')} ({likes})
                    </button>
                </div>

                <div className="comments-section" style={{ marginTop: '50px' }}>
                    <h3>{t('comments_title', '댓글')}</h3>
                    <div className="comment-item">
                        <p className="comment-author">댓글 작성자1</p>
                        <p className="comment-text">좋은 정보 감사합니다!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withTranslation()(PostDetailPage);
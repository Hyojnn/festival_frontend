// frontend/src/components/PostDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { FaUserCircle, FaCalendarAlt, FaHeart, FaCommentAlt, FaArrowLeft, FaTrashAlt, FaBriefcase, FaClipboardList, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import '../communityPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SPECIAL_JOB_NOTICE_ID = 'special-job-notice';
const ADMIN_USERNAME = 'admin';

function PostDetailPage({ t }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState('');

    const fetchComments = useCallback(async () => {
        if (id === SPECIAL_JOB_NOTICE_ID || (post && post.category === '공지')) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/api/posts/${id}/comments`);
            setComments(response.data);
        } catch (error) { console.error("댓글 불러오기 실패:", error); }
    }, [id, post]);

    useEffect(() => {
        const userName = localStorage.getItem('userName');
        const userId = localStorage.getItem('userId');
        if (userName && userId) { setCurrentUser({ username: userName, id: parseInt(userId, 10) }); }
        const fetchPost = async () => {
            setLoading(true);
            try {
                if (id === SPECIAL_JOB_NOTICE_ID) {
                    setPost({ id: SPECIAL_JOB_NOTICE_ID, title: t('special_notice_job_title', '축제 일자리 기회!'), content: t('special_notice_job_detail_content', '다양한 축제에서 자원봉사자 및 스태프로 활동할 기회를 놓치지 마세요. 열정적인 당신의 참여가 축제를 더욱 풍성하게 만듭니다. 지금 바로 일자리 정보를 확인하고 지원하세요!'), category: '공지', author: '운영팀', imageUrl: null, createdAt: new Date().toISOString(), likes: 0 });
                    return;
                }
                const response = await axios.get(`${API_BASE_URL}/api/posts/${id}`);
                setPost(response.data);
                setLikes(response.data.likes || 0);
                if (response.data.category !== '공지' && userName && userId) {
                    const token = localStorage.getItem('token');
                    const likedStatusResponse = await axios.get(`${API_BASE_URL}/api/posts/${id}/liked_status`, { headers: { Authorization: `Bearer ${token}` } });
                    setHasLiked(likedStatusResponse.data.hasLiked);
                }
            } catch (err) { setError(t('post_load_fail', '게시글을 불러오는 데 실패했습니다.')); } finally { setLoading(false); }
        };
        fetchPost();
    }, [id, t]);

    useEffect(() => { if (post) { fetchComments(); } }, [post, fetchComments]);

    const handleCommentSubmit = async (e) => { e.preventDefault(); const token = localStorage.getItem('token'); if (!token) { alert(t('login_required_to_comment', '댓글을 작성하려면 로그인이 필요합니다.')); return; } if (!newComment.trim()) { alert(t('comment_content_required', '댓글 내용을 입력해주세요.')); return; } try { await axios.post(`${API_BASE_URL}/api/posts/${id}/comments`, { content: newComment }, { headers: { Authorization: `Bearer ${token}` } }); setNewComment(''); fetchComments(); } catch (error) { alert(t('comment_submit_fail', '댓글 작성에 실패했습니다.')); } };
    const handleEditClick = (comment) => { setEditingCommentId(comment.id); setEditingText(comment.content); };
    const handleCancelEdit = () => { setEditingCommentId(null); setEditingText(''); };
    const handleUpdateComment = async (commentId) => { const token = localStorage.getItem('token'); if (!token || !editingText.trim()) return; try { await axios.put(`${API_BASE_URL}/api/comments/${commentId}`, { content: editingText }, { headers: { Authorization: `Bearer ${token}` } }); handleCancelEdit(); fetchComments(); } catch (error) { alert(t('comment_update_fail', '댓글 수정에 실패했습니다.')); } };
    const handleDeleteComment = async (commentId) => { if (!window.confirm(t('confirm_delete_comment', '정말로 이 댓글을 삭제하시겠습니까?'))) return; const token = localStorage.getItem('token'); if (!token) return; try { await axios.delete(`${API_BASE_URL}/api/comments/${commentId}`, { headers: { Authorization: `Bearer ${token}` } }); fetchComments(); } catch (error) { alert(t('comment_delete_fail', '댓글 삭제에 실패했습니다.')); } };
    const handleLikeComment = async (commentId) => { const token = localStorage.getItem('token'); if (!token) { alert(t('login_required_to_like', '좋아요를 누르려면 로그인이 필요합니다.')); return; } try { await axios.post(`${API_BASE_URL}/api/comments/${commentId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } }); fetchComments(); } catch (error) { alert(error.response?.data?.error || t('comment_like_fail', '댓글 좋아요 처리에 실패했습니다.')); } };
    const handleDelete = async () => { if (!window.confirm(t('confirm_delete_post', '정말로 이 게시글을 삭제하시겠습니까?'))) return; const token = localStorage.getItem('token'); if (!token) { alert(t('login_required_to_delete', '로그인이 필요합니다.')); return; } if (id === SPECIAL_JOB_NOTICE_ID) { alert(t('cannot_delete_special_notice', '이 공지사항은 삭제할 수 없습니다.')); return; } try { await axios.delete(`${API_BASE_URL}/api/posts/${id}`, { headers: { Authorization: `Bearer ${token}` } }); alert(t('post_delete_success', '게시글이 성공적으로 삭제되었습니다.')); navigate('/community/posts'); } catch (err) { const errorMessage = err.response?.status === 403 ? t('not_author_delete_permission', '본인이 작성한 게시글만 삭제할 수 있습니다.') : t('post_delete_fail', `게시글 삭제에 실패했습니다: ${err.response?.data?.error || err.message}`); alert(errorMessage); } };
    const handleLike = async () => { const token = localStorage.getItem('token'); if (!token) { alert(t('login_required_to_like', '좋아요를 누르려면 로그인이 필요합니다.')); navigate('/login'); return; } const isAuthor = currentUser && post.author === currentUser.username; if (isAuthor || hasLiked || post.category === '공지') { return; } try { const response = await axios.post(`${API_BASE_URL}/api/posts/${id}/like`, {}, { headers: { Authorization: `Bearer ${token}` } }); setLikes(response.data.newLikes); setHasLiked(true); alert(t('like_success', '좋아요가 반영되었습니다.')); } catch (err) { console.error("좋아요 실패:", err.response ? err.response.data : err.message); let errorMessage = t('like_fail', `좋아요 처리 중 오류가 발생했습니다: ${err.response?.data?.error || err.message}`); if (err.response) { if (err.response.status === 403) { errorMessage = t('cannot_like_own_post', '본인이 작성한 글에는 좋아요를 누를 수 없습니다.'); } else if (err.response.status === 409) { errorMessage = t('already_liked', '이미 좋아요를 누르셨습니다.'); setHasLiked(true); } else if (err.response.status === 401) { errorMessage = t('token_expired_relogin', '토큰이 만료되었습니다. 다시 로그인 해주세요.'); navigate('/login'); } } alert(errorMessage); } };

    if (loading) return <div className="community-page-container"><p>{t('loading_post', '게시글을 불러오는 중...')}</p></div>;
    if (error) return <div className="community-page-container"><p className="error-message">{error}</p></div>;
    if (!post) return <div className="community-page-container"><p>{t('post_not_found', '게시글을 찾을 수 없습니다.')}</p></div>;

    const formattedDate = new Date(post.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '');
    const isAuthor = currentUser && post.author === currentUser.username;
    const isNotice = post.category === '공지';
    const isSpecialJobNotice = post.id === SPECIAL_JOB_NOTICE_ID;
    const displayedAuthor = post.author === ADMIN_USERNAME ? "운영팀" : post.author;
    const isLikeButtonDisabled = isAuthor || hasLiked || isNotice;
    let sectionIcon = isSpecialJobNotice ? <FaBriefcase className="section-icon" /> : (isNotice ? <FaClipboardList className="section-icon" /> : null);

    return (
        <div className="community-page-container vibrant-theme">
            <div className="post-detail-header">
                <Link to={isNotice ? "/community/notices" : "/community/posts"} className="back-button"><FaArrowLeft /> {isNotice ? t('back_to_notices', '모든 공지사항으로 돌아가기') : t('back_to_all_posts', '모든 게시글로 돌아가기')}</Link>
                <h1>{t('post_detail_title', '게시글 상세')}</h1>
            </div>
            <section className="community-section info-content-section" style={{ paddingTop: '20px', paddingBottom: '20px', marginBottom: '0' }}>
                {isNotice && <h2 className="section-title">{sectionIcon}{t('notice_detail_heading', '공지사항 상세')}</h2>}
                {!isNotice && <h2>{post.title}</h2>}
                <div className="info-content">
                    {!isNotice && (
                        <div className="post-meta-detail">
                            <span className="meta-author"><FaUserCircle /> {displayedAuthor}</span>
                            <span className="meta-date"><FaCalendarAlt /> {formattedDate}</span>
                            <span className="meta-likes"><FaHeart /> {likes}</span>
                            <span className="meta-comments"><FaCommentAlt /> {comments.length}</span>
                            <span className="meta-type-badge">{post.category}</span>
                            {isAuthor && !isSpecialJobNotice && (<button onClick={handleDelete} className="delete-post-button" style={{ marginLeft: 'auto', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><FaTrashAlt /> {t('delete_post', '삭제')}</button>)}
                        </div>
                    )}
                    {post.imageUrl && (<div className="post-image-container"><img src={`${API_BASE_URL}${post.imageUrl}`} alt={post.title} /></div>)}
                    {isNotice && <p style={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: '15px' }}>{post.title}</p>}
                    <p style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>{post.content}</p>
                    {isSpecialJobNotice && (<div style={{ textAlign: 'center', margin: '30px 0 20px' }}> <Link to="/apply" className="job-find-button"><FaBriefcase style={{ marginRight: '10px' }} />{t('find_job_opportunity_button', '일자리 찾기 페이지로 이동')}</Link> </div>)}
                </div>
                {!isNotice && (<div className="post-actions-bottom" style={{ textAlign: 'center', marginTop: '30px' }}> <button onClick={handleLike} className="like-button" disabled={isLikeButtonDisabled} style={{ backgroundColor: isLikeButtonDisabled ? '#cccccc' : '#FF5722', color: 'white', border: 'none', borderRadius: '25px', padding: '12px 25px', fontSize: '1.1em', fontWeight: '600', cursor: isLikeButtonDisabled ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: isLikeButtonDisabled ? 'none' : '0 4px 10px rgba(255, 87, 34, 0.2)' }}><FaHeart /> {t('like_button', '좋아요')} ({likes})</button> </div>)}
            </section>
            {(post.category === '꿀팁' || post.category === '자유') && (
                <section className="comments-section">
                    <h3>{t('comments_title', '댓글')} ({comments.length})</h3>
                    {currentUser && (
                        <form onSubmit={handleCommentSubmit} className="comment-form">
                            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="따뜻한 댓글을 남겨주세요..." rows="4" required />
                            <button type="submit">댓글 등록</button>
                        </form>
                    )}
                    <div className="comment-list">
                        {comments.map(comment => (
                            <div key={comment.id} className="comment-item">
                                <div className="comment-avatar"><FaUserCircle /></div>
                                <div className="comment-body">
                                    {editingCommentId === comment.id ? (
                                        <div className="comment-edit-form">
                                            <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} rows="3" required />
                                            <div className='comment-edit-actions'>
                                                <button onClick={() => handleUpdateComment(comment.id)}>저장</button>
                                                <button onClick={handleCancelEdit}>취소</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="comment-header">
                                                <span className="comment-author">{comment.author_username}</span>
                                                <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="comment-text">{comment.content}</p>
                                        </>
                                    )}
                                    <div className="comment-actions">
                                        <div className="like-action">
                                            <button onClick={() => handleLikeComment(comment.id)} disabled={currentUser?.id === comment.user_id}>
                                                <FaHeart /> {comment.likes}
                                            </button>
                                        </div>
                                        {currentUser?.username === comment.author_username && editingCommentId !== comment.id && (
                                            <div className='comment-owner-actions'>
                                                <button onClick={() => handleEditClick(comment)}>수정</button>
                                                <button onClick={() => handleDeleteComment(comment.id)}>삭제</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default withTranslation()(PostDetailPage);
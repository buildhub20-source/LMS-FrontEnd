import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Clock, BarChart2, HelpCircle, Rocket, ArchiveIcon, XCircle,
  Edit2, Trash2, Plus, FileQuestion, Timer, Cpu, ChevronRight,
  Info, CheckCircle, RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import Spinner from '../../../components/common/Spinner';
import Alert from '../../../components/feedback/Alert';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import AssessmentStatusBadge from '../components/AssessmentStatusBadge';
import AdminQuestionForm from '../components/AdminQuestionForm';
import { DIFFICULTY_TONE } from '../constants/assessmentConstants';
import {
  useAdminAssessment,
  useAdminAssessmentQuestions,
  usePublishAssessment,
  useUnpublishAssessment,
  useCloseAssessment,
  useArchiveAssessment,
  useAddQuestion,
  useUpdateQuestion,
  useRemoveQuestion,
  useDeleteAdminAssessment,
} from '../hooks/useAdminAssessments';
import {
  useAdminSections,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useMoveQuestionToSection,
  useAddQuestionToSection,
} from '../hooks/useAdminSections';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../constants/routes';
import { formatDate } from '../../../utils/dateUtils';
import s from './AssessmentDetails.module.css';

export const AdminAssessmentDetailsPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState(null); // which section to add a question to
  const [editingQuestion, setEditingQuestion] = useState(null); // question object being edited
  const [showSectionForm, setShowSectionForm] = useState(false); // for adding a new section

  const { data: a, isLoading, error } = useAdminAssessment(assessmentId);
  const { data: questions = [] } = useAdminAssessmentQuestions(assessmentId);
  const { data: sections = [] } = useAdminSections(assessmentId);

  const publish   = usePublishAssessment();
  const unpublish = useUnpublishAssessment();
  const closeA    = useCloseAssessment();
  const archive   = useArchiveAssessment();
  const addQ      = useAddQuestion(assessmentId);
  const addSectionQ = useAddQuestionToSection(assessmentId);
  const removeQ   = useRemoveQuestion(assessmentId);
  const deleteA   = useDeleteAdminAssessment();

  const createSection = useCreateSection(assessmentId);
  const deleteSection = useDeleteSection(assessmentId);

  // useUpdateQuestion needs a questionId — we call mutateAsync directly
  const updateQ   = useUpdateQuestion(editingQuestion?.id);

  if (isLoading) return <Spinner fullPage />;
  if (error)     return <Alert tone="error">Failed to load assessment.</Alert>;

  const isDraft     = a.status === 'DRAFT';
  const isPublished = a.status === 'PUBLISHED';
  const canPublish  = isDraft && questions.length > 0;
  const canEditQuestions = isDraft || isPublished;

  const run = async (mutation, label, redirect = false) => {
    try {
      await mutation.mutateAsync(assessmentId);
      toast.success(label);
      if (redirect) navigate(ROUTES.ADMIN_ASSESSMENTS);
    } catch (e) {
      console.error('Action failed:', e);
      toast.error(e.message || 'An unexpected error occurred');
    }
  };

  const handleAddQuestion = async (values) => {
    try {
      if (targetSectionId) {
        await addSectionQ.mutateAsync({ sectionId: targetSectionId, data: values });
      } else {
        await addQ.mutateAsync(values); // This adds unsectioned
      }
      toast.success('Question added');
      setShowForm(false);
      setTargetSectionId(null);
    } catch (e) {
      console.error('Question add failed:', e);
      toast.error(e.message || 'Failed to add question');
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await createSection.mutateAsync({ title: formData.get('title') });
      toast.success('Section added');
      setShowSectionForm(false);
    } catch (err) {
      toast.error('Failed to add section');
    }
  };

  const handleUpdateQuestion = async (values) => {
    try {
      await updateQ.mutateAsync(values);
      toast.success('Question updated');
      setEditingQuestion(null);
    } catch (e) {
      console.error('Question update failed:', e);
      toast.error(e.message || 'Failed to update question');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this assessment permanently?')) return;
    try {
      await deleteA.mutateAsync(assessmentId);
      toast.success('Deleted');
      navigate(ROUTES.ADMIN_ASSESSMENTS);
    } catch (e) {
      console.error('Delete failed:', e);
      toast.error(e.message || 'Failed to delete');
    }
  };

  return (
    <div className={s.page}>

      {/* ── Hero banner ──────────────────────────────────────── */}
      <div className={s.heroBanner}>
        <div className={s.heroLeft}>
          <div className={s.heroBreadcrumb}>
            <Link to={ROUTES.ADMIN_ASSESSMENTS} className={s.heroBreadcrumbLink}>Assessments</Link>
            <ChevronRight size={12} />
            <span>{a.title}</span>
          </div>
          <h1 className={s.heroTitle}>{a.title}</h1>
          <div className={s.heroMeta}>
            <AssessmentStatusBadge status={a.status} />
            <span className={s.heroDate}>Last updated {formatDate(a.updatedAt)}</span>
          </div>
        </div>
        <div className={s.heroActions}>
          {canEditQuestions && (
            <button className={s.heroBtn}
              onClick={() => navigate(ROUTES.ADMIN_ASSESSMENT_EDIT(assessmentId))}>
              <Edit2 size={13} /> Edit
            </button>
          )}
          {isDraft && (
            <button className={`${s.heroBtn} ${s.heroBtnDanger}`}
              onClick={handleDelete} disabled={deleteA.isPending}>
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* ── Two-column body ──────────────────────────────────── */}
      <div className={s.body}>

        {/* ── LEFT: Questions ──────────────────────────────── */}
        <div className={s.mainCol}>

          {/* Description */}
          {a.description && (
            <div className={s.descCard}>
              <p className={s.descCardTitle}>About this assessment</p>
              <p className={s.descCardText}>{a.description}</p>
            </div>
          )}

          {/* Publish callout */}
          {isDraft && questions.length === 0 && (
            <div className={s.callout}>
              <div className={s.calloutIcon}><Info size={18} /></div>
              <div className={s.calloutText}>
                <p className={s.calloutTitle}>Ready to build your assessment?</p>
                <p className={s.calloutDesc}>Add at least one coding question with test cases, then publish.</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
                <Plus size={13} style={{ marginRight: 4 }} /> Add question
              </Button>
            </div>
          )}

          {/* Questions panel */}
          <div className={s.questionsPanel}>
            <div className={s.questionsPanelHead}>
              <h3 className={s.questionsPanelTitle}>
                Questions <span className={s.qBadge}>{questions.length}</span>
              </h3>
              {canEditQuestions && !showForm && !editingQuestion && (
                <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
                  <Plus size={13} style={{ marginRight: 4 }} /> Add question
                </Button>
              )}
            </div>

            {/* Add new question form */}
            {showForm && (
              <div className={s.inlineFormWrap}>
                <h4 className={s.inlineFormTitle}>
                  <Plus size={15} /> New Coding Question
                </h4>
                <AdminQuestionForm
                  onSubmit={handleAddQuestion}
                  onCancel={() => setShowForm(false)}
                  error={addQ.error}
                />
              </div>
            )}

            {/* Edit question form */}
            {editingQuestion && (
              <div className={s.inlineFormWrap}>
                <h4 className={s.inlineFormTitle}>
                  <Edit2 size={15} /> Edit Question: {editingQuestion.title}
                </h4>
                <AdminQuestionForm
                  defaultValues={editingQuestion}
                  onSubmit={handleUpdateQuestion}
                  onCancel={() => setEditingQuestion(null)}
                  submitLabel="Update question"
                  error={updateQ.error}
                />
              </div>
            )}

            {/* Empty state */}
            {questions.length === 0 && !showForm && (
              <div className={s.emptyQuestions}>
                <FileQuestion className={s.emptyIcon} />
                <p className={s.emptyTitle}>No questions yet</p>
                <p className={s.emptyDesc}>
                  {isDraft ? 'Add a coding question above to get started.' : 'No questions were added.'}
                </p>
              </div>
            )}

            {/* Questions/Sections List */}
            <div className={s.sectionsWrap}>
              {/* Add Section Button */}
              {canEditQuestions && !showSectionForm && (
                <div style={{ marginBottom: 16 }}>
                  <Button variant="outline" size="sm" onClick={() => setShowSectionForm(true)}>
                    <Plus size={13} style={{ marginRight: 4 }} /> Add Section
                  </Button>
                </div>
              )}

              {/* Add Section Form */}
              {showSectionForm && (
                <div className={s.inlineFormWrap}>
                  <h4 className={s.inlineFormTitle}>New Section</h4>
                  <form onSubmit={handleAddSection} className={s.sectionForm}>
                    <input name="title" placeholder="Section Title" required className={s.input} style={{ width: '100%', marginBottom: 12 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button type="submit" variant="primary" size="sm">Save Section</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowSectionForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Render Sections */}
              {sections.map(section => (
                <div key={section.id} className={s.sectionCard} style={{ border: '1px solid var(--border-color)', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
                  <div className={s.sectionHead} style={{ background: 'var(--lms-card-hover)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{section.title}</h4>
                      {section.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{section.description}</p>}
                    </div>
                    {canEditQuestions && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button variant="outline" size="sm" onClick={() => {
                          setTargetSectionId(section.id);
                          setShowForm(true);
                        }}>
                          <Plus size={13} style={{ marginRight: 4 }} /> Add Question
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                           if (window.confirm('Delete this section? Questions will be moved to unsectioned.')) {
                             deleteSection.mutateAsync(section.id).catch(e => toast.error('Failed to delete section'));
                           }
                        }}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className={s.questionsList} style={{ padding: '0 16px' }}>
                    {section.questions.length === 0 ? (
                      <p style={{ padding: '16px 0', margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>No questions in this section.</p>
                    ) : (
                      section.questions.map((q, i) => (
                        <div key={q.id} className={`${s.questionRow} ${editingQuestion?.id === q.id ? s.questionRowActive : ''}`} style={{ borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
                          <div className={s.questionNum}>Q{i + 1}</div>
                          <div className={s.questionContent}>
                            <p className={s.questionTitle}>{q.title}</p>
                            <div className={s.questionChips}>
                              <Badge tone={DIFFICULTY_TONE[q.difficulty] ?? 'neutral'}>{q.difficulty}</Badge>
                              <span className={s.chip}><BarChart2 size={10} /> {q.marks} marks</span>
                            </div>
                          </div>
                          {canEditQuestions && (
                            <div className={s.questionActions}>
                              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingQuestion(editingQuestion?.id === q.id ? null : q); }} title="Edit question">
                                <Edit2 size={13} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => removeQ.mutateAsync(q.id).catch(e => toast.error(e.message))} title="Delete question">
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}

              {/* Unsectioned Questions */}
              {questions.filter(q => !q.sectionId).length > 0 && (
                <div className={s.sectionCard} style={{ border: '1px solid var(--border-color)', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
                  <div className={s.sectionHead} style={{ background: 'var(--bg-primary)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>Unsectioned Questions</h4>
                    {canEditQuestions && (
                      <Button variant="outline" size="sm" onClick={() => { setTargetSectionId(null); setShowForm(true); }}>
                        <Plus size={13} style={{ marginRight: 4 }} /> Add Question
                      </Button>
                    )}
                  </div>
                  <div className={s.questionsList} style={{ padding: '0 16px' }}>
                    {questions.filter(q => !q.sectionId).map((q, i) => (
                      <div key={q.id} className={`${s.questionRow} ${editingQuestion?.id === q.id ? s.questionRowActive : ''}`} style={{ borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
                        <div className={s.questionNum}>Q{i + 1}</div>
                        <div className={s.questionContent}>
                          <p className={s.questionTitle}>{q.title}</p>
                          <div className={s.questionChips}>
                            <Badge tone={DIFFICULTY_TONE[q.difficulty] ?? 'neutral'}>{q.difficulty}</Badge>
                            <span className={s.chip}><BarChart2 size={10} /> {q.marks} marks</span>
                          </div>
                        </div>
                        {canEditQuestions && (
                          <div className={s.questionActions}>
                            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingQuestion(editingQuestion?.id === q.id ? null : q); }} title="Edit question">
                              <Edit2 size={13} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeQ.mutateAsync(q.id).catch(e => toast.error(e.message))} title="Delete question">
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Sidebar ───────────────────────────────── */}
        <div className={s.sidebar}>

          {/* Stats card */}
          <div className={s.sideCard}>
            <div className={s.sideCardHead}>Assessment Details</div>
            <div className={s.sideCardBody}>
              <div className={s.statRow}>
                <div className={s.statRowLabel}>
                  <div className={s.statRowIcon}><Clock size={13} /></div>
                  Duration
                </div>
                <span className={s.statRowValue}>{a.durationMinutes} min</span>
              </div>
              <div className={s.statRow}>
                <div className={s.statRowLabel}>
                  <div className={s.statRowIcon}><BarChart2 size={13} /></div>
                  Total Marks
                </div>
                <span className={s.statRowValue}>{a.totalMarks}</span>
              </div>
              <div className={s.statRow}>
                <div className={s.statRowLabel}>
                  <div className={s.statRowIcon}><RefreshCw size={13} /></div>
                  Max Attempts
                </div>
                <span className={s.statRowValue}>{a.maxAttempts}</span>
              </div>
              <div className={s.statRow}>
                <div className={s.statRowLabel}>
                  <div className={s.statRowIcon}><HelpCircle size={13} /></div>
                  Questions
                </div>
                <span className={s.statRowValue}>{a.questionCount ?? questions.length}</span>
              </div>
              {a.startTime && (
                <div className={s.statRow}>
                  <div className={s.statRowLabel}>
                    <div className={s.statRowIcon}><CheckCircle size={13} /></div>
                    Opens
                  </div>
                  <span className={s.statRowValue} style={{ fontSize: '0.75rem' }}>
                    {formatDate(a.startTime)}
                  </span>
                </div>
              )}
              {a.endTime && (
                <div className={s.statRow}>
                  <div className={s.statRowLabel}>
                    <div className={s.statRowIcon}><XCircle size={13} /></div>
                    Closes
                  </div>
                  <span className={s.statRowValue} style={{ fontSize: '0.75rem' }}>
                    {formatDate(a.endTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions card */}
          <div className={s.lifecycleCard}>
            <div className={s.sideCardHead}>Actions</div>
            <div className={s.lifecycleButtons}>
              {isDraft && (
                <button className={s.lifecycleBtn}
                  onClick={() => run(publish, 'Assessment published!')}
                  disabled={!canPublish || publish.isPending}
                  title={!canPublish ? 'Add questions first' : ''}>
                  <div className={`${s.lifecycleBtnIcon} ${s.publish}`}><Rocket size={15} /></div>
                  <div className={s.lifecycleBtnText}>
                    <div className={s.lifecycleBtnLabel}>Publish</div>
                    <div className={s.lifecycleBtnDesc}>
                      {canPublish ? 'Make visible to students' : 'Add questions first'}
                    </div>
                  </div>
                </button>
              )}
              {isPublished && (
                <>
                  <button className={s.lifecycleBtn}
                    onClick={() => run(unpublish, 'Moved back to Draft')}
                    disabled={unpublish.isPending}>
                    <div className={`${s.lifecycleBtnIcon} ${s.unpublish}`}><Edit2 size={15} /></div>
                    <div className={s.lifecycleBtnText}>
                      <div className={s.lifecycleBtnLabel}>Unpublish</div>
                      <div className={s.lifecycleBtnDesc}>Revert to draft</div>
                    </div>
                  </button>
                  <button className={s.lifecycleBtn}
                    onClick={() => run(closeA, 'Assessment closed')}
                    disabled={closeA.isPending}>
                    <div className={`${s.lifecycleBtnIcon} ${s.close}`}><XCircle size={15} /></div>
                    <div className={s.lifecycleBtnText}>
                      <div className={s.lifecycleBtnLabel}>Close</div>
                      <div className={s.lifecycleBtnDesc}>Stop accepting submissions</div>
                    </div>
                  </button>
                </>
              )}
              {a.status !== 'ARCHIVED' && (
                <button className={s.lifecycleBtn}
                  onClick={() => run(archive, 'Assessment archived', true)}
                  disabled={archive.isPending}>
                  <div className={`${s.lifecycleBtnIcon} ${s.archive}`}><ArchiveIcon size={15} /></div>
                  <div className={s.lifecycleBtnText}>
                    <div className={s.lifecycleBtnLabel}>Archive</div>
                    <div className={s.lifecycleBtnDesc}>Hide from all views</div>
                  </div>
                </button>
              )}
              {isDraft && (
                <button className={s.lifecycleBtn} onClick={handleDelete} disabled={deleteA.isPending}>
                  <div className={`${s.lifecycleBtnIcon} ${s.delete}`}><Trash2 size={15} /></div>
                  <div className={s.lifecycleBtnText}>
                    <div className={s.lifecycleBtnLabel} style={{ color: 'var(--color-danger)' }}>Delete</div>
                    <div className={s.lifecycleBtnDesc}>Permanently remove</div>
                  </div>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminAssessmentDetailsPage;

import React, { useState, useEffect } from 'react';
import { 
  X, Star, CheckCircle, FileText, 
  Image as ImageIcon, Edit, Save, AlertTriangle,
  Trash2, Plus
} from 'lucide-react';
import './ReportDetailModal.css';

const ReportDetailModal = ({ report, isOpen, onClose, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState('');
  const [editedRating, setEditedRating] = useState(0);
  const [editedRegularity, setEditedRegularity] = useState('');
  const [editedAttachments, setEditedAttachments] = useState([]);

  useEffect(() => {
    if (report) {
      setEditedComment(report.comment || report.content || '');
      setEditedRating(report.rating || 0);
      setEditedRegularity(report.regularity || '');
      setEditedAttachments(report.attachments || [
        { id: 1, name: "Contrat_Bail.pdf", type: "pdf" },
        { id: 2, name: "Etat_des_lieux.jpg", type: "image" }
      ]);
    }
  }, [report, isOpen]);

  if (!isOpen || !report) return null;

  const hasContestation = !!report.tenantResponse;

  const handleSave = () => {
    onEdit(report.id, {
      comment: editedComment,
      rating: editedRating,
      regularity: editedRegularity,
      attachments: editedAttachments
    });
    setIsEditing(false);
  };

  const handleRatingClick = (newRating) => {
    if (isEditing) {
      setEditedRating(newRating);
    }
  };

  const handleRegularityClick = (value) => {
    if (isEditing) {
      setEditedRegularity(value);
    }
  };

  const handleDeleteAttachment = (e, id) => {
    e.stopPropagation();
    setEditedAttachments(editedAttachments.filter(a => a.id !== id));
  };

  const handleAddAttachment = () => {
    const newId = Date.now();
    setEditedAttachments([...editedAttachments, { id: newId, name: `Nouveau_fichier_${editedAttachments.length + 1}.jpg`, type: "image" }]);
  };

  const handlePreview = (file) => {
    alert(`Ouverture de ${file.name} (Simulation)`);
    // Logic for real app: window.open(file.url, '_blank')
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-content report-detail-modal-v2 ${hasContestation ? 'two-columns' : ''}`}>
        <div className="modal-header">
          <h2>Détails du rapport</h2>
          <div className="header-btns">
             {!isEditing ? (
               <button className="btn-edit-header" onClick={() => setIsEditing(true)}>
                 <Edit size={16} /> Modifier
               </button>
             ) : (
               <button className="btn-save-header" onClick={handleSave}>
                 <Save size={16} /> Enregistrer
               </button>
             )}
             <button className="btn-close" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        <div className="report-detail-body-v2">
          {/* CÔTÉ RAPPORT (BAILLEUR) */}
          <div className="report-side">
            <div className="section-label-v2">Nom du locataire</div>
            <div className="tenant-card-v2">
               <div className="avatar-v2">{report.tenantName?.charAt(0) || '?'}</div>
               <div className="tenant-info-v2">
                  <h3>{report.tenantName}</h3>
                  <div className="tenant-contact-v2">
                    <p style={{ color: '#64748B', fontSize: '14px' }}>{report.tenantEmail || 'locataire@email.com'}</p>
                    <p style={{ color: '#64748B', fontSize: '14px' }}>{report.tenantPhone || '+225 01 02 03 04 05'}</p>
                  </div>
               </div>
            </div>

            <div className="section-label-v2">Note</div>
            <div className="stars-large-v2">
               {[1, 2, 3, 4, 5].map(s => (
                 <Star 
                    key={s} 
                    size={32} 
                    fill={(isEditing ? editedRating : report.rating) >= s ? "#73BA7C" : "none"} 
                    color="#73BA7C" 
                    onClick={() => handleRatingClick(s)}
                    style={{ cursor: isEditing ? 'pointer' : 'default' }}
                 />
               ))}
            </div>
            <div className="rating-text-v2">
                {(isEditing ? editedRating : report.rating)} sur 5 - {(isEditing ? editedRating : report.rating) >= 4 ? 'Excellent' : (isEditing ? editedRating : report.rating) >= 3 ? 'Assez bien' : 'Moyen'}
            </div>

            <div className="section-label-v2">Relation locataire-bailleur</div>
            <div className="chips-row-v2">
               {['Confirmée', 'Non confirmée', 'Réfusée'].map(value => (
                 <div 
                   key={value}
                   className={`chip-v2 ${value.toLowerCase().replace(/ /g, '-')} ${report.relation === value ? 'active' : ''}`}
                 >
                    {report.relation === value && <CheckCircle size={14} />}
                    <span>{value}</span>
                 </div>
               ))}
            </div>

            <div className="section-label-v2">Commentaire</div>
            <div className="comment-card-v2">
               {isEditing ? (
                 <textarea 
                   className="edit-textarea-v2" 
                   value={editedComment} 
                   onChange={(e) => setEditedComment(e.target.value)}
                 />
               ) : (
                 <p>{report.comment || report.content}</p>
               )}
            </div>

            <div className="section-label-v2">Régularité dans le paiement</div>
            <div className="chips-row-v2">
               {['Toujours à temps', 'Peu de Retard', 'Pas régulier'].map(value => (
                 <div 
                   key={value}
                   className={`chip-v2 ${value.toLowerCase().replace(/ /g, '-').replace(/à/g, 'a')} ${(isEditing ? editedRegularity : report.regularity) === value ? 'active' : ''}`}
                   onClick={() => handleRegularityClick(value)}
                   style={{ cursor: isEditing ? 'pointer' : 'default' }}
                 >
                   <span>{value}</span>
                 </div>
               ))}
            </div>

            <div className="section-label-v2">Pièces Jointes - Preuves</div>
            <div className="proofs-grid-v2">
               {(isEditing ? editedAttachments : (report.attachments || [
                 { id: 1, name: "Contrat_Bail.pdf", type: "pdf" },
                 { id: 2, name: "Etat_des_lieux.jpg", type: "image" }
               ])).map(file => (
                 <div key={file.id} className="proof-item-v2" onClick={() => handlePreview(file)}>
                    <div className="proof-icon-v2">
                        {file.type === 'pdf' ? <FileText size={24} color="#94a3b8" /> : <ImageIcon size={24} color="#94a3b8" />}
                    </div>
                    <span>{file.name}</span>
                    {isEditing && (
                      <button className="btn-delete-proof" onClick={(e) => handleDeleteAttachment(e, file.id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                 </div>
               ))}
               {isEditing && (
                 <div className="proof-item-v2 add-proof" onClick={handleAddAttachment}>
                    <div className="proof-icon-v2"><Plus size={24} color="#0F322B" /></div>
                    <span>Ajouter</span>
                 </div>
               )}
            </div>
          </div>

          {/* CÔTÉ CONTESTATION (LOCATAIRE) - Si existant */}
          {hasContestation && (
            <div className="contestation-side">
               <div className="section-label-v2">Contestation du locataire</div>
               <div className="contestation-alert-v2">
                  <AlertTriangle size={20} />
                  <span>Le locataire conteste ce rapport</span>
               </div>

               <div className="section-label-v2">Message du locataire</div>
               <div className="comment-card-v2 contestation-msg">
                  <p>{report.tenantResponse}</p>
               </div>

               <div className="section-label-v2">Preuves fournies par le locataire</div>
               <div className="proofs-grid-v2">
                  <div className="proof-item-v2" onClick={() => handlePreview({ name: 'preuve_image.jpg' })}>
                     <div className="proof-icon-v2"><ImageIcon size={24} color="#f43f5e" /></div>
                     <span>preuve_image.jpg</span>
                  </div>
                  <div className="proof-item-v2" onClick={() => handlePreview({ name: 'justificatif.pdf' })}>
                     <div className="proof-icon-v2"><FileText size={24} color="#f43f5e" /></div>
                     <span>justificatif.pdf</span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;

import React, { useState, useRef } from 'react';
import { 
  X, Star, CheckCircle, FileText, 
  Image as ImageIcon, Plus, Trash2, 
  AlertTriangle, ShieldCheck, Info
} from 'lucide-react';
import { reports } from '../../data/mockData';
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose, tenant, tenantName, tenantEmail, tenantPhone, propertyName, propertyType, propertyPrice, onSave, onSubmit, reportToEdit }) => {
  const [rating, setRating] = useState(0);
  const [relation, setRelation] = useState(tenant?.status || 'Non-vérifié');
  const [regularity, setRegularity] = useState('Toujours à temps');
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      if (reportToEdit) {
        setRating(reportToEdit.rating || 0);
        setRelation(reportToEdit.relation || tenant?.status || 'Non-vérifié');
        setRegularity(reportToEdit.regularity || 'Toujours à temps');
        setComment(reportToEdit.comment || reportToEdit.text || '');
        setAttachments(reportToEdit.attachments || []);
      } else {
        setRating(0);
        setRelation(tenant?.status || 'Non-vérifié');
        setRegularity('Toujours à temps');
        setComment('');
        setAttachments([]);
      }
    }
  }, [isOpen, tenant, reportToEdit]);

  if (!isOpen) return null;

  const handleTriggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type.includes('pdf') ? 'pdf' : 'image',
      url: URL.createObjectURL(file),
      file: file,
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = null; // Reset input
  };

  const handleDeleteAttachment = (id) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const getRegularityClass = (val) => {
    if (val === 'Toujours à temps') return 'toujours-a-temps';
    if (val === 'Peu de Retard') return 'peu-de-retard';
    return 'retard';
  };

  const getRelationClass = (val) => {
    if (val === 'Vérifié') return 'confirmée';
    if (val === 'Non-vérifié') return 'non-confirmée';
    return 'réfusée';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content report-modal-v2-form">
        <div className="modal-header">
          <h2>{reportToEdit ? 'Modifier l\'évaluation du locataire' : 'Nouvelle évaluation du locataire'}</h2>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="report-modal-body-v2">
          <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            onChange={handleFileChange} 
            accept="image/*,application/pdf" 
            style={{ display: 'none' }} 
          />

          <form onSubmit={(e) => { 
            e.preventDefault(); 
              const tName = tenant?.name || tenantName;
              const tId = tenant?.id;
              if (reportToEdit) {
                // Edit existing report
                const updatedReport = {
                  ...reportToEdit,
                  tenantId: tId || reportToEdit.tenantId,
                  tenantName: tName,
                  rating,
                  relation,
                  regularity,
                  comment,
                  text: comment,
                  attachments,
                };
                if (onSubmit) {
                  onSubmit(updatedReport);
                }
              } else {
                // Create new report
                const newReport = {
                  id: Date.now(),
                  tenantId: tId,
                  tenantName: tName,
                  date: new Date().toLocaleDateString('fr-FR'),
                  type: 'Général',
                  status: 'Validé',
                  rating,
                  comment,
                  text: comment,
                  relation,
                  regularity,
                  author: 'Coulibaly Sékou',
                  propertyName: propertyName || tenant?.property || null,
                  propertyType: propertyType || null,
                  price: propertyPrice || null,
                  location: null,
                  attachments,
                };
                if (onSubmit) {
                  onSubmit(newReport);
                } else {
                  reports.unshift(newReport);
                }
              }
              alert(reportToEdit ? 'Rapport mis à jour avec succès !' : 'Rapport publié avec succès !');
              if (onSave) onSave();
              onClose(); 
          }} className="report-form-v2">
            
            {/* Tenant Info Section */}
            <div className="section-label-v2">Locataire évalué</div>
            <div className="tenant-card-v2">
               <div className="avatar-v2">{(tenant?.name || tenantName)?.charAt(0) || '?'}</div>
               <div className="tenant-info-v2">
                  <h3>{tenant?.name || tenantName}</h3>
                  <div className="tenant-contact-v2">
                    <p>{tenant?.email || tenantEmail || 'locataire@email.com'}</p>
                    <p>{tenant?.phone || tenantPhone || '+225 01 02 03 04 05'}</p>
                  </div>
               </div>
            </div>

            {/* Rating Section */}
            <div className="section-label-v2">Note globale</div>
            <div className="stars-large-v2 clickable">
               {[1, 2, 3, 4, 5].map(s => (
                 <Star 
                    key={s} 
                    size={32} 
                    fill={rating >= s ? "#73BA7C" : "none"} 
                    color="#73BA7C" 
                    onClick={() => setRating(s)}
                    style={{ cursor: 'pointer' }}
                 />
               ))}
            </div>
            <div className="rating-text-v2">
                {rating > 0 ? `${rating} sur 5 - ${rating >= 4 ? 'Excellent' : rating >= 3 ? 'Assez bien' : 'Moyen'}` : 'Veuillez sélectionner une note'}
            </div>

            {/* Relation Section */}
            <div className="section-label-v2">Relation locataire-bailleur (Automatique)</div>
            <div className="chips-row-v2">
               {['Vérifié', 'Non-vérifié', 'Refusé'].map(value => (
                 <div 
                   key={value}
                   className={`chip-v2 ${getRelationClass(value)} ${relation === value ? 'active' : ''}`}
                   style={{ cursor: 'default', opacity: relation === value ? 1 : 0.5 }}
                 >
                    {relation === value && <CheckCircle size={14} />}
                    <span>{value}</span>
                 </div>
               ))}
            </div>

            {/* Comment Section */}
            <div className="section-label-v2">Commentaire détaillé</div>
            <div className="comment-card-v2">
               <textarea 
                 className="edit-textarea-v2" 
                 placeholder="Décrivez votre expérience avec ce locataire..."
                 value={comment} 
                 onChange={(e) => setComment(e.target.value)}
                 required
               />
            </div>

            {/* Regularity Section */}
            <div className="section-label-v2">Régularité dans le paiement</div>
            <div className="chips-row-v2">
               {['Toujours à temps', 'Peu de Retard', 'Retard'].map(value => (
                 <div 
                   key={value}
                   className={`chip-v2 ${getRegularityClass(value)} ${regularity === value ? 'active' : ''}`}
                   onClick={() => setRegularity(value)}
                   style={{ cursor: 'pointer' }}
                 >
                   <span>{value}</span>
                 </div>
               ))}
            </div>

            {/* Attachments Section */}
            <div className="section-label-v2">Pièces Jointes - Preuves (Depuis votre appareil)</div>
            <div className="proofs-grid-v2">
               {attachments.map(file => (
                 <div key={file.id} className="proof-item-v2">
                    <div className="proof-icon-v2">
                        {file.type === 'pdf' ? <FileText size={24} color="#94a3b8" /> : <ImageIcon size={24} color="#94a3b8" />}
                    </div>
                    <span title={file.name} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>
                      {file.name}
                    </span>
                    <button type="button" className="btn-delete-proof" onClick={() => handleDeleteAttachment(file.id)}>
                      <Trash2 size={14} />
                    </button>
                 </div>
               ))}
               <div className="proof-item-v2 add-proof" onClick={handleTriggerFileSelect}>
                  <div className="proof-icon-v2"><Plus size={24} color="#0F322B" /></div>
                  <span>Sélectionner un fichier</span>
               </div>
            </div>

            <div className="form-footer-v2">
              <button type="button" className="btn-cancel-v2" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn-submit-v2" disabled={!rating || !comment}>
                {reportToEdit ? 'Enregistrer les modifications' : 'Publier le rapport'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;

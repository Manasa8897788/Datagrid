import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel'; 
import DownloadIcon from '@mui/icons-material/Download'; 


const StyledConfirmButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#9C27B0',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '8px', 
  textTransform: 'none', 
  fontSize: '1rem',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: '#7B1FA2', 
  },
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'transparent', 
  color: '#9C27B0', 
  border: '1px solid #9C27B0', 
  padding: '12px 24px',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: 'rgba(156, 39, 176, 0.04)', 
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '1.5rem', 
  fontWeight: 600, 
  color: '#333',
  paddingBottom: theme.spacing(1),
}));

const StyledDialogContentText = styled(DialogContentText)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '1rem', 
  color: '#555', 
  marginBottom: theme.spacing(3), 
}));


interface CustomAlertDialogProps {
  confirmOpen: boolean;
  handleCancel: () => void; 
  handleConfirm: () => void;
  dialogTitle: string; 
  dialogContentText: React.ReactNode; 
  cancelButtonText?: string; 
  confirmButtonText?: string; 
  cancelButtonIcon?: React.ReactNode;
  confirmButtonIcon?: React.ReactNode; 
}

function CustomAlertDialog({
  confirmOpen,
  handleCancel,
  handleConfirm,
  dialogTitle,
  dialogContentText,
  cancelButtonText = 'Cancel', 
  confirmButtonText = 'Confirm', 
  cancelButtonIcon = <CancelIcon />, 
  confirmButtonIcon = <DownloadIcon />, 
}: CustomAlertDialogProps) {
  return (
    <Dialog open={confirmOpen} onClose={handleCancel} maxWidth="xs" fullWidth>
      <StyledDialogTitle>{dialogTitle}</StyledDialogTitle>
      <DialogContent>
        <StyledDialogContentText>
          {dialogContentText}
        </StyledDialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', paddingBottom: '20px' }}>
        <StyledCancelButton onClick={handleCancel} startIcon={cancelButtonIcon}>
          {cancelButtonText}
        </StyledCancelButton>
        <StyledConfirmButton onClick={handleConfirm} autoFocus startIcon={confirmButtonIcon}>
          {confirmButtonText}
        </StyledConfirmButton>
      </DialogActions>
    </Dialog>
  );
}

export default CustomAlertDialog;

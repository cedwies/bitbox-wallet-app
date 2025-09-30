import { useTranslation } from 'react-i18next';
import { Dialog, DialogButtons } from '@/components/dialog/dialog';
import { Button } from '@/components/forms';

type Props = {
  open: boolean;
  onClose: () => void;
}

// this is the little popup that shows up if you try to toggle incognito with a device plugged in
export const IncognitoModeDeviceConnectedDialog = ({ open, onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <Dialog title={t('incognitoMode.deviceConnected.title')} medium onClose={onClose} open={open}>
      <p>{t('incognitoMode.deviceConnected.message')}</p>
      <DialogButtons>
        {/* just a simple confirm button, since it's only an info box */}
        <Button primary onClick={onClose}>{t('dialog.confirm')}</Button>
      </DialogButtons>
    </Dialog>
  );
};

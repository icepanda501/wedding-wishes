
declare global {
    interface Window {
        HIDE_QR?: boolean;
    }
}

function isMobile() {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
  }

const QRCodeFloater = () => {    

    const hideOnMobile = window.innerWidth < 768 || isMobile();

    if (hideOnMobile || window.HIDE_QR) {
        return null;
    }

    return (
        <div className='qr-code-floater'>
            <img src="domain-qr.jpeg" alt="QR Code" />
        </div>
    );
}
export default QRCodeFloater;
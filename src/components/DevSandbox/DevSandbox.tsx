import { useState } from 'react';
import { useLogin } from '../../context/LoginContext';
import './DevSandbox.css';

function DevSandbox() {
  const [devConsoleOpen, setDevConsoleOpen] = useState<boolean>(true);
  const {
    mfaSessionId,
    deviceId,
    loginStage,
    pushApproved,
    pushSelectedNum,
    simulatePushApprove: onSimulatePushApprove,
  } = useLogin();

  if (!mfaSessionId) return null;

  return (
    <div className={`dev-sandbox-bubble ${devConsoleOpen ? 'expanded' : ''}`}>
      <div className="dev-sandbox-header" onClick={() => setDevConsoleOpen(!devConsoleOpen)}>
        <span>⚙️ Dev Sandbox & Push Simulator</span>
        <button className="dev-sandbox-toggle-btn">{devConsoleOpen ? '▼' : '▲'}</button>
      </div>
      {devConsoleOpen && (
        <div className="dev-sandbox-body">
          <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#666' }}>
            Bảng điều khiển giả lập dành riêng cho nhà phát triển để kiểm tra luồng MFA mà không cần thiết bị thật.
          </p>
          
          <div className="dev-sandbox-stat">
            <span className="stat-label">Active MFA Session:</span>
            <span className="stat-val">{mfaSessionId}</span>
          </div>
          <div className="dev-sandbox-stat">
            <span className="stat-label">Device UUID:</span>
            <span className="stat-val">{deviceId.substring(0, 15)}...</span>
          </div>

          {loginStage === 'mfa_push' && (
            <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', fontSize: '12px' }}>
                Giả lập phê duyệt Notification (Push MFA)
              </p>
              <p style={{ fontSize: '11px', color: '#555', marginBottom: '12px' }}>
                Khi click nút dưới đây, backend sẽ đánh dấu session là APPROVED. Trình duyệt đang chạy polling ở tần suất 2 giây sẽ ngay lập tức bắt được trạng thái này và hoàn tất đăng nhập.
              </p>
              <button 
                onClick={onSimulatePushApprove}
                className="btn-primary" 
                style={{ width: '100%', fontSize: '13px', padding: '10px' }}
                disabled={pushApproved}
              >
                {pushApproved ? '✓ Đã Phê Duyệt' : `Bấm Đồng Ý Trên Điện Thoại (Số ${pushSelectedNum})`}
              </button>
            </div>
          )}

          {loginStage === 'mfa_otp' && (
            <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', fontSize: '12px' }}>
                Email OTP Demo Code
              </p>
              <p style={{ fontSize: '12px' }}>
                Mã Email OTP hợp lệ trong database (kiểm tra logs hoặc dùng mã này để demo): <strong style={{ color: 'var(--primary)', fontSize: '13px' }}>123456</strong>
              </p>
            </div>
          )}

          {loginStage === 'mfa_totp' && (
            <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', fontSize: '12px' }}>
                Google Authenticator Demo Code
              </p>
              <p style={{ fontSize: '12px' }}>
                Mã Google Authenticator hợp lệ để demo: <strong style={{ color: 'var(--primary)', fontSize: '13px' }}>654321</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DevSandbox;

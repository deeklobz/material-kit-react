import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';
import { useAuth } from 'src/context/AuthContext';

// ----------------------------------------------------------------------

export default function RoleDebugPage() {
  const { user } = useAuth();

  return (
    <>
      <title>{`Role Debug - ${CONFIG.appName}`}</title>

      <Box sx={{ mb: 5 }}>
        <Typography variant="h4">User Role Debug</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Check current user role and permissions
        </Typography>
      </Box>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Current User Information
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
            <Typography variant="body2" color="text.secondary">
              Full Name:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user?.first_name} {user?.last_name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Email:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user?.email}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Role:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>{user?.role || 'N/A'}</strong>
            </Typography>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
            <Typography variant="body2" color="text.secondary">
              Organization ID:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user?.organization_id || 'N/A'}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Status:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user?.status}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              User ID:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user?.id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Role Mapping:
          </Typography>
          <Typography variant="body2" component="div">
            • <strong>platform_admin</strong> → Platform Admin Dashboard
            <br />
            • <strong>org_admin</strong> → Property Manager Dashboard
            <br />
            • <strong>manager</strong> → Property Manager Dashboard
            <br />
            • <strong>agent</strong> → Limited Property Manager View
            <br />
            • <strong>caretaker</strong> → Maintenance View
            <br />• <strong>tenant</strong> → Tenant Portal
          </Typography>
        </Box>
      </Card>
    </>
  );
}

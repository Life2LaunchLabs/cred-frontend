import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Link,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

export function Welcome() {
  const theme = useTheme();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const isDark = theme.palette.mode === "dark" || prefersDark;

  return (
    <>
      {/* If you already put CssBaseline in main.tsx, remove this line */}
      <CssBaseline />

      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            React Router + MUI
          </Typography>
          <Button color="inherit" href="https://mui.com/" target="_blank" rel="noreferrer">
            MUI Docs
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Stack spacing={3} alignItems="center">
          <Box sx={{ width: "100%", maxWidth: 420 }}>
            <Box
              component="img"
              src={isDark ? logoDark : logoLight}
              alt="React Router"
              sx={{ width: "100%", display: "block" }}
            />
          </Box>

          <Typography variant="h4" align="center">
            It works 🎉
          </Typography>

          <Typography variant="body1" color="text.secondary" align="center">
            If you see a raised card, MUI-styled buttons, and AppBar typography,
            your integration is good.
          </Typography>

          <Paper variant="outlined" sx={{ width: "100%", p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" gutterBottom align="center">
              What&apos;s next?
            </Typography>

            <Stack spacing={1}>
              {resources.map(({ href, text }) => (
                <Button
                  key={href}
                  variant="contained"
                  fullWidth
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {text}
                </Button>
              ))}
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 2, textAlign: "center" }}
            >
              Or read the{" "}
              <Link href="https://reactrouter.com/docs" target="_blank" rel="noreferrer">
                React Router docs
              </Link>
              .
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}

const resources = [
  { href: "https://reactrouter.com/docs", text: "React Router Docs" },
  { href: "https://mui.com/material-ui/getting-started/", text: "Material UI Getting Started" },
  { href: "https://rmx.as/discord", text: "Join Discord" },
];

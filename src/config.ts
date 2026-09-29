// Text for the PUBLIC shell: the boot screen, login screen and status bar.
// Anything here is visible to anyone who opens the site, so keep party
// details and lore out of it. Those belong in content/ (encrypted).

export const SHELL = {
  corp: 'HALCYON BIOSCIENCES',
  corpSub: 'B I O S C I E N C E S',
  terminal: 'TERMINAL 7-B',
  facility: 'SUBLEVEL B4 // RESEARCH STATION 1031',
  archiveName: 'RESTRICTED INCIDENT ARCHIVE',
}

// ANSI Shadow figlet font. Rendered in a system monospace font so the box characters line up.
export const LOGO = String.raw`
██╗  ██╗ █████╗ ██╗      ██████╗██╗   ██╗ ██████╗ ███╗   ██╗
██║  ██║██╔══██╗██║     ██╔════╝╚██╗ ██╔╝██╔═══██╗████╗  ██║
███████║███████║██║     ██║      ╚████╔╝ ██║   ██║██╔██╗ ██║
██╔══██║██╔══██║██║     ██║       ╚██╔╝  ██║   ██║██║╚██╗██║
██║  ██║██║  ██║███████╗╚██████╗   ██║   ╚██████╔╝██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝`.slice(1)

export type BootLine =
  | { kind: 'text'; text: string; tone?: 'dim' | 'warn' | 'alert'; pause?: number }
  | { kind: 'check'; label: string; status: 'ok' | 'fail' | 'warn'; statusText?: string; pause?: number }
  | { kind: 'progress'; label: string; duration: number }
  | { kind: 'banner'; text: string; pause?: number }
  | { kind: 'blank'; pause?: number }

export const BOOT_LINES: BootLine[] = [
  { kind: 'text', text: 'HALCYON BIOSCIENCES  BIOS v4.10.31', pause: 250 },
  { kind: 'text', text: '(C) 1996 HALCYON BIOSCIENCES CORP. ALL RIGHTS RESERVED.', tone: 'dim', pause: 350 },
  { kind: 'blank', pause: 150 },
  { kind: 'check', label: 'MAIN POWER GRID', status: 'fail', pause: 600 },
  { kind: 'check', label: 'AUX GENERATOR B', status: 'warn', statusText: ' 23%', pause: 450 },
  { kind: 'check', label: 'MEMORY TEST 65536K', status: 'ok', pause: 250 },
  { kind: 'check', label: 'LIFE SUPPORT // SECTOR 7', status: 'fail', pause: 400 },
  { kind: 'check', label: 'AIR HANDLER AHU-3', status: 'fail', pause: 550 },
  { kind: 'check', label: 'BIOHAZARD LOCKDOWN', status: 'warn', statusText: 'ACTIVE', pause: 400 },
  { kind: 'check', label: 'MOUNT ARCHIVE VOLUME C-33', status: 'ok', pause: 300 },
  { kind: 'text', text: '  WARNING: 14,208 SECTORS UNREADABLE', tone: 'warn', pause: 350 },
  { kind: 'progress', label: 'RECOVERING INDEX', duration: 1500 },
  { kind: 'check', label: 'SECURITY DAEMON', status: 'warn', statusText: 'DEGRADED', pause: 350 },
  { kind: 'blank', pause: 200 },
  { kind: 'banner', text: '*** FACILITY STATUS: QUARANTINE LEVEL 4 ***', pause: 1100 },
]

export const TICKER =
  '⚠ CONTAINMENT BREACH IN SUBLEVEL B4 ⚠ AVOID ALL AREAS WITH VISIBLE GREEN VAPOR ⚠ ' +
  'DO NOT APPROACH FORMER STAFF ⚠ ALL EXITS SEALED BY ORDER OF SENTINEL COMMAND ⚠ ' +
  'THIS IS NOT A DRILL ⚠ '

export const LOGIN_DENIED = [
  'ACCESS DENIED. PHRASE NOT RECOGNIZED.',
  'ACCESS DENIED. THIS ATTEMPT HAS BEEN LOGGED.',
  'ACCESS DENIED. SECURITY PERSONNEL HAVE BEEN NOTIFIED. SECURITY PERSONNEL HAVE NOT RESPONDED.',
  'ACCESS DENIED. LOCKOUT PROTOCOL OFFLINE. CONTINUE AT YOUR OWN RISK.',
  'ACCESS DENIED. ARE YOU ONE OF THEM?',
]

export const LOGIN_HINT = {
  after: 3,
  text: 'HINT: YOUR AUTHORIZATION PHRASE WAS ISSUED WITH YOUR EVACUATION NOTICE.',
}

export const OVERRIDE_DENIED = [
  'OVERRIDE REJECTED. INVALID CODE WORD.',
  'OVERRIDE REJECTED. DIRECTOR CREDENTIALS REQUIRED.',
  'OVERRIDE REJECTED. HE WOULD NOT HAVE CHOSEN SOMETHING SO OBVIOUS.',
]

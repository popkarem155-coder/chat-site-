// Global function stubs for sandbox/iframe compatibility
function sendMessage() { if(window._sendMessage) window._sendMessage(); }
function openChat(user) { if(window._openChat) window._openChat(user); }
function closeChat() { if(window._closeChat) window._closeChat(); }
function openDrawer() { if(window._openDrawer) window._openDrawer(); }
function closeDrawer() { if(window._closeDrawer) window._closeDrawer(); }
function openPrivateMessages() { if(window._openPrivateMessages) window._openPrivateMessages(); }
function closePrivateMessages() { if(window._closePrivateMessages) window._closePrivateMessages(); }
function openPublicChat() { if(window._openPublicChat) window._openPublicChat(); }
function closePublicChat() { if(window._closePublicChat) window._closePublicChat(); }
function sendPublicMessage() { if(window._sendPublicMessage) window._sendPublicMessage(); }
function renderUsers(filter) { if(window._renderUsers) window._renderUsers(filter); }
function editProfile() { if(window._editProfile) window._editProfile(); }
function updateProfileName(value) { if(window._updateProfileName) window._updateProfileName(value); }
function openMyProfile() { if(window._openMyProfile) window._openMyProfile(); }
function closeProfile() { if(window._closeProfile) window._closeProfile(); }
function showHome() { if(window._showHome) window._showHome(); }
function showFeaturedUsers() { if(window._showFeaturedUsers) window._showFeaturedUsers(); }
function chooseProfileImage() { if(window._chooseProfileImage) window._chooseProfileImage(); }
function saveProfile() { if(window._saveProfile) window._saveProfile(); }
function editMyProfile() { if(window._editMyProfile) window._editMyProfile(); }
function cancelProfileEdit() { if(window._cancelProfileEdit) window._cancelProfileEdit(); }
function openProfileChat() { if(window._openProfileChat) window._openProfileChat(); }
function blockProfileUser() { if(window._blockProfileUser) window._blockProfileUser(); }
function askBlockProfileUser() { if(window._askBlockProfileUser) window._askBlockProfileUser(); }
function cancelBlockProfileUser() { if(window._cancelBlockProfileUser) window._cancelBlockProfileUser(); }
function confirmBlockUser() { if(window._confirmBlockUser) window._confirmBlockUser(); }
function toggleProfileBlockedUsers() { if(window._toggleProfileBlockedUsers) window._toggleProfileBlockedUsers(); }
function unblockProfileUser(userId) { if(window._unblockProfileUser) window._unblockProfileUser(userId); }
function chooseAttachment() { if(window._chooseAttachment) window._chooseAttachment(); }
function toggleVoiceRecording() { if(window._toggleVoiceRecording) window._toggleVoiceRecording(); }
function cancelVoiceRecording() { if(window._cancelVoiceRecording) window._cancelVoiceRecording(); }
function finishVoiceRecordingPreview() { if(window._finishVoiceRecordingPreview) window._finishVoiceRecordingPreview(); }
function discardVoicePreview() { if(window._discardVoicePreview) window._discardVoicePreview(); }
function sendVoicePreview() { if(window._sendVoicePreview) window._sendVoicePreview(); }
function openCountryPicker() { if(window._openCountryPicker) window._openCountryPicker(); }
function filterCountries(value) { if(window._filterCountries) window._filterCountries(value); }
function toggleCountryPicker(event) { if(window._toggleCountryPicker) window._toggleCountryPicker(event); }
function toggleChatMenu(event) { if(window._toggleChatMenu) window._toggleChatMenu(event); }
function openChatProfileFromMenu() { if(window._openChatProfileFromMenu) window._openChatProfileFromMenu(); }
function blockCurrentUser() { if(window._blockCurrentUser) window._blockCurrentUser(); }
function handleCardBgUpload(event) { if(window._handleCardBgUpload) window._handleCardBgUpload(event); }
function clearCardBg() { if(window._clearCardBg) window._clearCardBg(); }

(function() {
  'use strict';

  const embeddedWomanAvatar = 'data:image/webp;base64,UklGRuwDAABXRUJQVlA4WAoAAAAQAAAAPwAAPwAAQUxQSNQBAAABCjm2tq1t9DdKaTrRzAZMOwjXw8tgZp7pOMzphmkDTFUY+mHGMLPM8q/v28Cr/4uICYDuSPmezrcfJpYcyMSHt117yiOKsmyq6x1dTbk2o731myNUYqf7F1JazcCZOIXolc8pD78g6lXw8PuUx+ZQyJOyJ+spz/HU6LN2/kiR/LnL0hSoXUwRFQS12HecFFmIrcF/nCL92C4qcCdF/HagCKvWoYZay93ORZ+8wFXZD5+hKXMReppi+TRU6PA6DxwuEP2QYvo+mu+KzxZ5Yl/4fI7mnPEZn1ZAZIBTvyhsWuBkBKj3Wdch0svLSPkor9GyPau8jHT5zDvfcnvzgZtMcBtf5rbkcAM/4SYT3MwHbvKW25subp17VnkZKR/lNVoW6eVlwqqOVx2waYGTESDSzwmigNOcBABin/kYycEVPpdV3ug7Lu9MPhxa54GDqmDwKY8nwUIo+8HBlMHtzkV6AuXaqnWoodZyh8BtakZQrP2Y1mMbxW+4T+nBRugMNS5RWW4KKb0le3/TwL4Spb3yheMdXlYqL8PHPnoFMcrj+PVvXny/EVcEk5dGlvTI8IWkImrvaB2aWHeH8cHmbaWKsl1z+GbPtzkn5WP2W/fNw9WlSjdWUDgg8gEAADANAJ0BKkAAQAA+2VqoTiglJCI1+5zJABsJbACvt8LA0Wm6ygu8Vekfbu+YDzWtNxCGr8aG0Lb+gtQ1Q5xrF2COJwOWSauXIvr4iM6rSsjcrjjBeOFVnxyypSllLIPZWlNb/wO4LO6RPq0i8XCInHUQAAD++uam7sujn/avwMXVkb/a+FwloNpRFR6x4DYcm/YbxCZ33RMZrE3R1YVrwSQhW657U499ZhktwZQM5DG7TAaokyd8fuGSpi4jDGuAvp53/iwHqAjsNvHZNPOD3QfY1IcZrZX27iQ+Mo+qaDPLE44nBzIslYMDmu+K5VeRtrpAUSzAr7Xoe/aUhKKtiee/QR8OX3nnOZvuCgtGlDTs3AwATS23PzjAuFqFnV/BApSzTufS6BxEeqcdOFbVtqELT4kBEFXOoN3EyAmZlqtGPoDz2JuMOuAT/VWelBevl73/wD+rPs19X+6HdfGfgqo6aixmcNYgOTBek4e2ThEcPLoV1bu6cZ/zLNGoTY5CTAiLmRVR0bOFJfb4O1GeVbQsU/7rtiPctoOvGFFpRq1aGCYaNasTXC741tnXSdkkMPWFzyjPP0u4eazyvr7KadVokrh11VodztaN88D3A+D39AAuHiqxdobCVCc5YUymbKbLQjR8g7pcg8hpTTWjkiHAAA==';
  const embeddedWomanProfileIconSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHRpdGxlLz48ZyBpZD0iXzI2LXdvbWFuIj48cG9seWdvbiBwb2ludHM9IjM1IDQ1IDMzIDQ3IDMxIDQ3IDI5IDQ1IDMyIDQyIDM1IDQ1IiBmaWxsPSJyZ2IoMjUyLCAxNTEsIDE1OCkiLz48cG9seWdvbiBwb2ludHM9IjMzIDQ3IDM1IDU2IDMyIDU5IDI5IDU2IDMxIDQ3IDMzIDQ3IiBmaWxsPSJyZ2IoMjUyLCAxNTEsIDE1OCkiLz48cGF0aCBkPSJNMzIsNDJsLTMsMy00LTRWMzguNTVsMS4zMy0uMjdhMS45OTMsMS45OTMsMCwwLDAsMS4yMy0uNzJaIiBmaWxsPSJyZ2IoMjMzLCAyMzcsIDI0NSkiLz48cGF0aCBkPSJNMzksMzguNTVWNDFsLTQsNC0zLTMsNC40NC00LjQ0YTEuOTkzLDEuOTkzLDAsMCwwLDEuMjMuNzJaIiBmaWxsPSJyZ2IoMjMzLCAyMzcsIDI0NSkiLz48cGF0aCBkPSJNMzEsNDdsLTIsOSwzLDN2NEgxN2EyMy4xNjksMjMuMTY5LDAsMCwxLDEuNS05SDEzVjQ0LjI1YTMuOTk0LDMuOTk0LDAsMCwxLDMuMTgtMy45MkwxOCwzOS45Nmw3LTEuNDFWNDFsNCw0WiIgZmlsbD0icmdiKDIzMywgMjM3LCAyNDUpIi8+PHBhdGggZD0iTTQ2LDM5Ljk2bDEuODIuMzdBMy45OTQsMy45OTQsMCwwLDEsNTEsNDQuMjVWNTRINDUuNUEyMy4xNjksMjMuMTY5LDAsMCwxLDQ3LDYzSDMyVjU5bDMtMy0yLTksMi0yLDQtNFYzOC41NVoiIGZpbGw9InJnYigyMzMsIDIzNywgMjQ1KSIvPjxwYXRoIGQ9Ik0xNi4xOCw0My4zMywxOCw0Mi45Nmw3LTEuNDFWNDRsNCw0LDEuNDU1LDEuNDU1TDMxLDQ3bC0yLTItNC00VjM4LjU1bC03LDEuNDEtMS44Mi4zN0EzLjk5NCwzLjk5NCwwLDAsMCwxMyw0NC4yNXYzQTMuOTk0LDMuOTk0LDAsMCwxLDE2LjE4LDQzLjMzWiIgZmlsbD0icmdiKDE3NSwgMTgwLCAyMDApIi8+PHBvbHlnb24gcG9pbnRzPSIyOS41NDUgNTYuNTQ1IDI5IDU5IDMyIDYyIDMyIDU5IDI5LjU0NSA1Ni41NDUiIGZpbGw9InJnYigxNzUsIDE4MCwgMjAwKSIvPjxwb2x5Z29uIHBvaW50cz0iMzQuNDU1IDU2LjU0NSAzMiA1OSAzMiA2MiAzNSA1OSAzNC40NTUgNTYuNTQ1IiBmaWxsPSJyZ2IoMTc1LCAxODAsIDIwMCkiLz48cGF0aCBkPSJNNDcuODIsNDAuMzMsNDYsMzkuOTZsLTctMS40MVY0MWwtNCw0LTIsMiwuNTQ1LDIuNDU1TDM1LDQ4bDQtNFY0MS41NWw3LDEuNDEsMS44Mi4zN0EzLjk5NCwzLjk5NCwwLDAsMSw1MSw0Ny4yNXYtM0EzLjk5NCwzLjk5NCwwLDAsMCw0Ny44Miw0MC4zM1oiIGZpbGw9InJnYigxNzUsIDE4MCwgMjAwKSIvPjxwYXRoIGQ9Ik0yNy41NiwzNy41NmExLjk5MywxLjk5MywwLDAsMS0xLjIzLjcyTDI1LDM4LjU1bC03LDEuNDFWMjFhMTcuNDc5LDE3LjQ3OSwwLDAsMCw1LjY1LS45TDI0LDI0YTcuOTc0LDcuOTc0LDAsMCwwLDQuMDMsNi45NEwyOCwzMXY1LjMxQTEuOTYyLDEuOTYyLDAsMCwxLDI3LjU2LDM3LjU2WiIgZmlsbD0icmdiKDIwNCwgMTU5LCA4NikiLz48cGF0aCBkPSJNMzIsMUExNCwxNCwwLDAsMCwxOCwxNXY2YTE3LjQ3OSwxNy40NzksMCwwLDAsNS42NS0uOUMzMi40OCwxNy4xNiwzNiw4LDM2LDhjMCw1LDUsNSw1LDVsLS4zNiw0SDQxYTMsMywwLDAsMSwwLDZoLS45MUw0MCwyNGE4LjAxNCw4LjAxNCwwLDAsMS0yLjM0LDUuNjYsNy44MzgsNy44MzgsMCwwLDEtMS42OSwxLjI4TDM2LDMxdjUuMzFhMS45NjIsMS45NjIsMCwwLDAsLjQ0LDEuMjUsMS45OTMsMS45OTMsMCwwLDAsMS4yMy43MmwxLjMzLjI3LDcsMS40MVYxNUExNCwxNCwwLDAsMCwzMiwxWiIgZmlsbD0icmdiKDI1MCwgMjA5LCAxMjcpIi8+PHBhdGggZD0iTTIxLDE4QTEzLjk4LDEzLjk4LDAsMCwxLDQzLjI3NCw2LjcyNiwxMy45ODcsMTMuOTg3LDAsMCwwLDE4LDE1djZhMTguNDQyLDE4LjQ0MiwwLDAsMCwzLS4yNDFaIiBmaWxsPSJyZ2IoMjUyLCAyNDIsIDE4MikiLz48cGF0aCBkPSJNMzksMzRsLS4wMy0uMDZhNy44MzgsNy44MzgsMCwwLDAsMS42OS0xLjI4QTguMDE0LDguMDE0LDAsMCwwLDQzLDI3bC4wOS0xSDQ0YTIuOTgxLDIuOTgxLDAsMCwwLDItLjc3NlYyMC43NzZBMi45ODEsMi45ODEsMCwwLkEsNDQsMjBhMywzLDAsMCwxLTMsM2gtLjkxTDQwLDI0YTguMDE0LDguMDE0LDAsMCwxLTIuMzQsNS42Niw3LjgzOCw3LjgzOCwwLDAsMS0xLjY5LDEuMjhMMzYsMzF2NS4zMWExLjk2MiwxLjk2MiwwLDAsMCwuNDQsMS4yNSwxLjk5MywxLjk5MywwLDAsMCwxLjIzLjcybDEuMzMuMjdaIiBmaWxsPSJyZ2IoMjA0LCAxNTksIDg2KSIvPjxwYXRoIGQ9Ik0xMyw1NGg1LjVBMjMuMTY5LDIzLjE2OSwwLDAsMCwxNyw2M0gxM1oiIGZpbGw9InJnYigyNTUsIDE4MiwgMTI4KSIvPjxwYXRoIGQ9Ik01MSw1NHY5SDQ3YTIzLjE2OSwyMy4xNjksMCwwLDAtMS41LTlaIiBmaWxsPSJyZ2IoMjU1LCAxODIsIDEyOCkiLz48cGF0aCBkPSJNMzYuNDQsMzcuNTYsMzIsNDJsLTQuNDQtNC40NEExLjk2MiwxLjk2MiwwLDAsMCwyOCwzNi4zMVYzMWwuMDMtLjA2YTcuOTY0LDcuOTY0LDAsMCwwLDcuOTQsMEwzNiwzMXY1LjMxQTEuOTYyLDEuOTYyLDAsMCwwLDM2LjQ0LDM3LjU2WiIgZmlsbD0icmdiKDI1NSwgMTgyLCAxMjgpIi8+PHBhdGggZD0iTTMyLDM1YTcuOTU0LDcuOTU0LDAsMCwwLDMuOTctMS4wNkwzNiwzNFYzMWwtLjAzLS4wNmE3Ljk2NCw3Ljk2NCwwLDAsMS03Ljk0LDBMMjgsMzF2M2wuMDMtLjA2QTcuOTU0LDcuOTU0LDAsMCwwLDMyLDM1WiIgZmlsbD0icmdiKDIzNSwgMTUxLCA5MykiLz48cGF0aCBkPSJNMzYsMzhsLjQ0LS40NEExLjk2MiwxLjk2MiwwLDAsMSwzNiwzNi4zMVoiIGZpbGw9InJnYigyMzUsIDE1MSwgOTMpIi8+PHBhdGggZD0iTTI4LDM2LjMxYTEuOTYyLDEuOTYyLDAsMCwxLS40NCwxLjI1TDI4LDM4WiIgZmlsbD0icmdiKDIzNSwgMTUxLCA5MykiLz48cGF0aCBkPSJNMzksMTdhMywzLDAsMCwxLDAsNmgtLjkxbC41NS02WiIgZmlsbD0icmdiKDI1NSwgMTgyLCAxMjgpIi8+PHBhdGggZD0iTTQwLjA5LDIzLDQwLDI0YTguMDE0LDguMDE0LDAsMCwxLTIuMzQsNS42Niw3LjgzOCw3LjgzOCwwLDAsMS0xLjY5LDEuMjhBOCw4LDAsMCwxLDI0LDI0bC0uMzUtMy45QzMyLjQ4LDE3LjE2LDM2LDgsMzYsOGMwLDUsNSw1LDUsNWwtLjM2LDRaIiBmaWxsPSJyZ2IoMjU1LCAyMTgsIDE3MCkiLz48cGF0aCBkPSJNMzYsMTJhNC43NjcsNC43NjcsMCwwLDAwLDQuNjQyLDQuOTc3TDQxLDEzczUtMC01LTVjMCwwLTMuNTIsOS4xNi0xMi4zNSwxMi4xTDI0LDIzLjk2NUMzMi41NjUsMjAuOSwzNiwxMiwzNiwxMloiIGZpbGw9InJnYigyNTUsIDE4MiwgMTI4KSIvPjxwYXRoIGQ9Ik0xOCw0MFYxNWExNCwxNCwwLDAsMSwyOCwwVjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYigwLCAwLCAwKSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIycHgiLz48cGF0aCBkPSJNMjMuNjQsMjBsLjAxLjFMMjQsMjRhNy45OTIsNy45OTIsMCwwLDAsMTEuOTcsNi45NCw3LjgzOCw3LjgzOCwwLDAsMCwxLjY5LTEuMjhBOC4wMTQsOC4wMTQsMCwwLDAsNDAsMjRsLjA5LTEsLjU1LTZMNDEsMTNzLTUsMC01LTVjMCwwLTMuNTIsOS4xNi0xMi4zNSwxMi4xQTE3LjQ3OSwxNy40NzksMCwwLDEsMTgsMjEiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiKDAsIDAsIDApIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjJweCIvPjxwYXRoIGQ9Ik0yOCwzMXY1LjMxYTEuOTYyLDEuOTYyLDAsMCwxLS40NCwxLjI1LDEuOTkzLDEuOTkzLDAsMCwxLTEuMjMuNzJMMjUsMzguNTVsLTcsMS40MS0xLjgyLjM3QTMuOTk0LDMuOTk0LDAsMCwwLDEzLDQ0LjI1VjYzSDUxVjQ0LjI1YTMuOTk0LDMuOTk0LDAsMCwwLTMuMTgtMy45Mkw0NiwzOS45NmwtNy0xLjQxLTEuMzMtLjI3YTEuOTkzLDEuOTkzLDAsMCwxLTEuMjMtLjcyQTEuOTYyLDEuOTYyLDAsMCwxLDM2LDM2LjMxVjMxIiBmaWxsPSJub25lIiBzdHJva2U9InJnYigwLCAwLCAwKSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIycHgiLz48cGF0aCBkPSJNNDEsMTdoMWEzLDMsMCwwLDEsMCw2SDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYigwLCAwLCAwKSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIycHgiLz48cGF0aCBkPSJNOTcsNTB2M2E3LjA0OCw3LjA0OCwwLDAsMC0uNSwxQTIzLjE2OSwyMy4xNjksMCwwLDAsMTcsNjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiKDAsIDAsIDApIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjJweCIvPjxwb2x5bGluZSBwb2ludHM9IjEzIDU0IDE4LjUgNTQgMTkgNTQiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiKDAsIDAsIDApIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjJweCIvPjxwYXRoIGQ9Ik00NSw1MHYzYTcuMDQ4LDcuMDQ4LDAsMCwxLC41LDFBMjMuMTY5LDIzLjE2OSwwLDAsMSw0Nyw2MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2IoMCwgMCwgMCkiIHN0cm9rZT0icm91bmQiIHN0cm9rZS13aWR0aD0iMnB4Ii8+PHBvbHlsaW5lIHBvaW50cz0iNTEgNTQgNDUuNSA1NCA0NSA1NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2IoMCwgMCwgMCkiIHN0cm9rZT0icm91bmQiIHN0cm9rZS13aWR0aD0iMnB4Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjcgMzcgMjcuNTYgMzcuNTYgMzIgNDIgMzYuNDQgMzcuNTYgMzcgMzciIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiKDAsIDAsIDApIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjJweCIvPjxwb2x5bGluZSBwb2ludHM9IjM5IDM4IDM5IDM4LjU1IDM5IDQxIDM1IDQ1IDMyIDQyIDI5IDQ1IDI1IDQxIDI1IDM4LjU1IDI1IDM4IiBmaWxsPSJub25lIiBzdHJva2U9InJnYigwLCAwLCAwKSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIycHgiLz48cG9seWxpbmUgcG9pbnRzPSIyOSA0NSAzMSA0NyAzMyA0NyAzNSA0NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2IoMCwgMCwgMCkiIHN0cm9rZT0icmdiKDAsIDAsIDApIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjJweCIvPjxwb2x5bGluZSBwb2ludHM9IjMxIDQ3IDI5IDU2IDMyIDU5IDM1IDU2IDMzIDQ3IiBmaWxsPSJub25lIiBzdHJva2U9InJnYigwLCAwLCAwKSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIy cHgiLz48bGluZSB4MT0iMzIiIHgyPSIzMiIgeTE9IjU5IiB5Mj0iNjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiKDAsIDAsIDApIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjJweCIvPjwvZz48L3N2Zz4=';
  // Avatar people person profile Icon by Just Icon on Icon-Icons.com
  const embeddedWomanProfileIcon = 'data:image/webp;base64,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';
  const embeddedWomanProfileIconFile = 'female-default-avatar.svg';
  const embeddedManProfileIconFile = 'male-default-avatar.svg';
  const embeddedManAvatar = 'data:image/webp;base64,UklGRsgDAABXRUJQVlA4WAoAAAAQAAAAPwAAPwAAQUxQSO8BAAABCkna/hmSFN1jV45t22obN+nSM0cwV/bMGTwr2zOl8a6xsrtXVbFIRca/DvCrf0TEBCCfT567avMOs3kVmMKckujNZ5m2zh5GIfP0ZrRkrlazGi78GJQ+OXGpMaTLovDbEal09F1ksQ5WSzInlYPDVlBFtc+zMlC8qC0KJHS0RwbOx0IBrLuXkxqCjbJ9Xwua8n5FJb+ltn9KlewzBY3/7Few7qvUmo2v0D2pOYd8FB3N6QZT5K22R2rPtZ6sF5Lgc8tLOEsBLR4WJyVJXuwWztFA2GXW2wJRA6eGUSojxumiJHvRYW6Czo85tpJBOlxii0rCEdtNSjcEMPkZpacsMDdDCXMFVrVRalsJbO6kBCOwo5dSz458sLmTEozAqjZKrSsF5mYoYa7A5KeUwAK4SemGABClFLaVDNLhw7Y5CTo/jA0X6VyEY8MIlRHjNOstFQMnhHM0EBaui5M0eJEbwlkKCAuPc95QYOMFTf369TfBc/Fp/VDsDeaxbmzgd2NCr8RG+D/8XyeGUFnJ+nAl1B5O6JKEUL3piR6GoX7O2f7gBs7PQZDjGl9lg8HrJhYBm1g6iIyZIzRcEvswpsZ8jC8VmlrNV1JDfobTV9kSOs8rj995+bujpw9sfr+8e6R8viA4ldds31XgNfMh8jkAVlA4ILIBAAAwCwCdASpAAEAAPvVeqU4qpL+iLhkuM/AeiWwAwgYAqXm3VN2GV9pmyU2d2QpjeNIbZK6aIn3vRgpQDmAsvzOR1sDYIo14gqz3isHpoBcIQGmZ7hQduqU1YvTBe9+ou0WLcAD+7rf//Dz/+GE//0P0ndQ63ry+qVz54UJlmnPeXGQhrZY+ccMv7OUby7MtFOusZP1K62HcCDBisK40vB96lkinaMRenkMLVwAMzROakLA31+lttOxAVxlrKdV2575WE10l288h2xIZiAdRO3ofYLLwQtGtvXPp3FiffnqJY0CfKIy3oa+PHxHiKjdBPSM33X5umpSyKXRivrBzcTtcz+24Np/iWjwNSfp5DcmJNSpKK1yZXRohBmMFk2bLqosVibdbrAieE/KmqRDOWr0vss0SQRDw7qKIhvTSb2xSjvNeDl86EzxVctQvug4poxr6dzF6crD++xxsEBe//bQv+xuly6+JkJfFujM9Hm3jGs8Q3haANWZTvqxQ1Kt0Z9RdBfW5xZVlsf5j2LxN7LdfEL/+Yl//LQP/+H8LbOTiebSJSG5CmFjt+s0Nv/E7unOAAA==';
  const embeddedHeroImage = 'data:image/webp;base64,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';

  const bios = [
    'مطور تطبيقات', 'مصمم جرافيك', 'كاتب محتوى',
    'لاعب ألعاب', 'مصور فوتوغرافي', 'موسيقي',
    'مسافر دائم', 'قارئ نهم', 'طالب جامعي',
    'رائد أعمال', 'شيف طبخ', 'رياضي',
    'مدون تقني', 'فنان رقمي', 'مترجم'
  ];

  const replies = [
    { text: 'مرحباً! أنا سعيد جداً بالتحدث معك', delay: 900 },
    { text: 'هذا موضوع مثير للاهتمام فعلاً!', delay: 1300 },
    { text: 'أتفق معك تماماً', delay: 1100 },
    { text: 'واو! لم أكن أعرف ذلك من قبل', delay: 1600 },
    { text: 'هههههه', delay: 700 },
    { text: 'بالتأكيد، دعنا نتحدث أكثر عن هذا الموضوع', delay: 1200 },
    { text: 'رائع! هذا ما كنت أبحث عنه بالضبط', delay: 1000 },
    { text: 'شكراً جزيلاً على المشاركة!', delay: 800 },
    { text: 'هل يمكنك إرسال المزيد من التفاصيل؟', delay: 1400 },
    { text: 'أحب هذا التطبيق كثيراً', delay: 600 },
    { text: 'هل تعرف أي أماكن حلوة نروحها؟', delay: 1100 },
    { text: 'صح كلامك مية بالمية!', delay: 500 },
  ];

  const countryCodes = [
    'AF','AL','DZ','AS','AD','AO','AI','AQ','AG','AR','AM','AW','AU','AT','AZ','BS','BH','BD','BB','BY','BE','BZ','BJ','BM','BT','BO','BQ','BA','BW','BV','BR','IO','BN','BG','BF','BI','CV','KH','CM','CA','KY','CF','TD','CL','CN','CX','CC','CO','KM','CG','CD','CK','CR','CI','HR','CU','CW','CY','CZ','DK','DJ','DM','DO','EC','EG','SV','GQ','ER','EE','SZ','ET','FK','FO','FJ','FI','FR','GF','PF','TF','GA','GM','GE','DE','GH','GI','GR','GL','GD','GP','GU','GT','GG','GN','GW','GY','HT','HM','VA','HN','HK','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','JM','JP','JE','JO','KZ','KE','KI','KP','KR','KW','KG','LA','LV','LB','LS','LR','LY','LI','LT','LU','MO','MG','MW','MY','MV','ML','MT','MH','MQ','MR','MU','YT','MX','FM','MD','MC','MN','ME','MS','MA','MZ','MM','NA','NR','NP','NL','NC','NZ','NI','NE','NG','NU','NF','MK','MP','NO','OM','PK','PW','PS','PA','PG','PY','PE','PH','PN','PL','PT','PR','QA','RE','RO','RU','RW','BL','SH','KN','LC','MF','PM','VC','WS','SM','ST','SA','SN','RS','SC','SL','SG','SX','SK','SI','SB','SO','ZA','GS','SS','ES','LK','SD','SR','SJ','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TK','TO','TT','TN','TR','TM','TC','TV','UG','UA','AE','GB','US','UM','UY','UZ','VU','VE','VN','VG','VI','WF','EH','YE','ZM','ZW'
  ];
  const countryNameFormatter = new Intl.DisplayNames(['ar'], { type: 'region' });
  const countries = countryCodes.map(code => ({
    code,
    name: countryNameFormatter.of(code) || code,
    flag: code.replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397))
  }));
  const demoCountries = ['EG', 'SA', 'AE', 'MA', 'JO', 'TN', 'DZ'];
  const demoAges = [28, 24, 31, 26, 29, 22, 27];
  const demoGenders = ['ذكر', 'أنثى', 'ذكر', 'أنثى', 'ذكر', 'ذكر', 'أنثى'];
  const featuredAfterMs = 60 * 60 * 1000;
  const inactiveResetMs = 2 * 60 * 1000;
  const offlineGraceMs = 30 * 1000;
  const initialSessionStartedAt = Date.now();
  const presenceSessionKey = 'mofchat.presence-session.v1';
  const presenceJoinedAtKey = 'mofchat.presence-joined-at.v1';
  const directoryStartedAtKey = 'mofchat.directory-started-at.v1';
  const directoryOrderStorageKey = 'mofchat.directory-order.v1';
  let directoryStartedAt = initialSessionStartedAt;
  let storedDirectoryOrder = {};
  try {
    const storedDirectoryStartedAt = Number(
      localStorage.getItem(directoryStartedAtKey) ||
      sessionStorage.getItem(directoryStartedAtKey)
    );
    directoryStartedAt = storedDirectoryStartedAt || initialSessionStartedAt;
    storedDirectoryOrder = JSON.parse(localStorage.getItem(directoryOrderStorageKey) || '{}');
    sessionStorage.setItem(directoryStartedAtKey, String(directoryStartedAt));
    localStorage.setItem(directoryStartedAtKey, String(directoryStartedAt));
  } catch (error) {
    // Use this page load as the directory baseline if session storage is unavailable.
  }

  let users = [
    { id: 1, name: 'أحمد علي', initials: 'أع', color: '#7c3aed', bio: bios[0], badge: 'vip', lastSeen: 'الآن', msgCount: 0, isNew: false },
    { id: 2, name: 'سارة محمد', initials: 'سم', color: '#c026d3', bio: bios[1], badge: null, lastSeen: 'الآن', msgCount: 0, isNew: false },
    { id: 3, name: 'محمد خالد', initials: 'مخ', color: '#9333ea', bio: bios[2], badge: 'new', lastSeen: 'الآن', msgCount: 0, isNew: false },
    { id: 4, name: 'ليلى أحمد', initials: 'لأ', color: '#6366f1', bio: bios[3], badge: null, lastSeen: 'الآن', msgCount: 0, isNew: false },
    { id: 5, name: 'عمر سامي', initials: 'عس', color: '#6d28d9', bio: bios[4], badge: 'vip', lastSeen: 'الآن', msgCount: 0, isNew: false },
    { id: 6, name: 'نور الدين', initials: 'ند', color: '#a855f7', bio: bios[5], badge: null, lastSeen: 'الآن', msgCount: 0, isNew: false },
    { id: 7, name: 'فاطمة يوسف', initials: 'في', color: '#8b5cf6', bio: bios[6], badge: 'new', lastSeen: 'الآن', msgCount: 0, isNew: false },
  ];
  users.forEach((user, index) => {
    user.age = demoAges[index];
    user.gender = demoGenders[index];
    user.countryCode = demoCountries[index];
    user.country = countries.find(country => country.code === user.countryCode);
    user.connectedAt = initialSessionStartedAt - (index === 0 || index === 4 ? 65 * 60 * 1000 : 0);
    user.lastActivityAt = initialSessionStartedAt;
    const storedJoinedAt = Number(storedDirectoryOrder[String(user.id)]);
    user.joinedAt = storedJoinedAt || directoryStartedAt - ((users.length - index) * 2000);
    user.blockedUsers = [];
  });
  try {
    users.forEach(user => {
      if (!storedDirectoryOrder[String(user.id)]) {
        storedDirectoryOrder[String(user.id)] = user.joinedAt;
      }
    });
    localStorage.setItem(directoryOrderStorageKey, JSON.stringify(storedDirectoryOrder));
  } catch (error) {
    // Keep the in-memory ordering if browser storage is unavailable.
  }

  const extraNames = ['خالد', 'ريم', 'علي', 'هند', 'ياسين', 'مريم', 'طارق', 'دنيا', 'حسن', 'آية', 'زياد', 'لمى', 'فهد', 'رنا'];
  const colors = ['#7c3aed', '#c026d3', '#9333ea', '#6366f1', '#6d28d9', '#a855f7', '#8b5cf6', '#ec4899', '#d946ef', '#a855f7'];

  let currentChatUser = null;
  let messages = {};
  let userIdCounter = 8;
  let isTyping = false;
  let totalChats = 0;
  let profileTargetUser = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let blockedUsers = new Set();
  const blockedUsersByOwner = new Map();
  let selectedCountry = null;
  let messageAnimations = new Set();
  let isFeaturedView = false;
  let appHiddenAt = null;
  const myProfile = {
    id: 'me',
    name: 'أحمد محمد',
    initials: 'أم',
    color: '#7c3aed',
    bio: '',
    age: 28,
    gender: 'ذكر',
    nationality: 'مصر',
    countryCode: 'EG',
    country: countries.find(country => country.code === 'EG'),
    avatar: '',
    cardBg: '1786370860128.png',
    blockedUsers: []
  };
  const blockedUsersStorageKey = 'mofchat.blocked-users.v1';
  const myProfileStorageKey = 'mofchat.profile.v1';

  const isCurrentUser = user => Boolean(
    user && (user === myProfile || user.id === myProfile.id)
  );

  const privateMessagesData = [
    { id: 101, name: 'سارة محمد', initials: 'سم', color: '#c026d3', preview: 'مرحباً! كيف حالك اليوم؟', time: '10:30 صباحًا', unread: 2, latestAt: 5 },
    { id: 102, name: 'محمد خالد', initials: 'مخ', color: '#9333ea', preview: 'هل رأيت التحديث الجديد؟', time: '9:15 صباحًا', unread: 1, latestAt: 4 },
    { id: 103, name: 'عمر سامي', initials: 'عس', color: '#6d28d9', preview: 'شكراً جزيلاً على المساعدة!', time: 'أمس', unread: 0, latestAt: 3 },
    { id: 104, name: 'ليلى أحمد', initials: 'لأ', color: '#6366f1', preview: 'متى نلتقي غداً؟', time: 'أمس', unread: 0, latestAt: 2 },
    { id: 105, name: 'فاطمة يوسف', initials: 'في', color: '#8b5cf6', preview: 'أرسلت لك الملف المطلوب', time: 'الأحد', unread: 0, latestAt: 1 },
  ];
  const publicMessagesStorageKey = 'mofchat.public-messages.v1';
  let publicMessages = [
    { id: 'public-welcome-1', from: 'user', name: 'سارة محمد', initials: 'س', color: '#c026d3', text: 'مساء الخير يا أهل موف، ما أجمل موضوع نبدأ به اليوم؟', time: 'الآن' },
    { id: 'public-welcome-2', from: 'user', name: 'عمر سامي', initials: 'ع', color: '#6366f1', text: 'شاركونا آخر شيء ألهمكم هذا الأسبوع.', time: 'منذ دقيقة', featured: true }
  ];

  const embeddedHeroImageFixed = embeddedHeroImage
    .replace('v9ag8qwy', 'v9GdRKFiq7f5SMpDt9ag8qwy')
    .replace('B54cckqJu4', 'B54ccqkJu4')
    .replace('SKpu+3Y5', 'SKpu3+1Y5');
  const heroImage = document.querySelector('.hero-romance-image');
  if (heroImage) heroImage.src = embeddedHeroImageFixed;
  const $ = id => document.getElementById(id);
  const usersList = $('users-list');
  const mainView = $('main-view');
  const mainHeader = $('main-header');
  const chatView = $('chat-view');
  const chatUsername = $('chat-username');
  const chatUsernameBadge = $('chat-username-badge');
  const chatAvatar = $('chat-avatar');
  const chatStatusText = $('chat-status-text');
  const chatStatus = $('chat-status');
  const messagesArea = $('messages-area');
  const msgInput = $('msg-input');
  const sendBtn = $('send-btn');
  const backBtn = $('back-btn');
  const onlineCount = $('stat-users');
  const statChats = $('stat-chats');
  const searchInput = $('search-input');
  const toast = $('toast');
  const toastText = $('toast-text');
  const menuBtn = $('menu-btn');
  const drawerOverlay = $('drawer-overlay');
  const sideDrawer = $('side-drawer');
  const drawerMenu = document.querySelector('.drawer-menu');
  const drawerClose = $('drawer-close');
  const drawerProfileName = $('drawer-profile-name');
  const drawerProfileAvatar = $('drawer-profile-avatar');
  const messagesIconBtn = $('messages-icon-btn');
  const messagesBadge = $('messages-badge');
  const privateMessagesPage = $('private-messages-page');
  const privateMessagesBack = $('private-messages-back');
  const privateMessagesList = $('private-messages-list');
  const publicChatPage = $('public-chat-page');
  const publicChatMessages = $('public-chat-messages');
  const publicMsgInput = $('public-msg-input');
  const publicRoomPreviewMessages = $('public-room-preview-messages');
  const publicRoomPresenceCount = $('public-room-presence-count');
  const profilePage = $('profile-page');
  const profileAvatar = $('profile-avatar');
  const profileAvatarInput = $('profile-avatar-input');
  const profileNameInput = $('profile-name-input');
  const profileBioInput = $('profile-bio-input');
  const profileAgeInput = $('profile-age-input');
  const profileGenderInput = $('profile-gender-input');
  const profileNationalityInput = $('profile-nationality-input');
  const profileDisplayName = $('profile-display-name');
  const profileDisplayBadge = $('profile-display-badge');
  const profileDisplayBio = $('profile-display-bio');
  const profileDisplayAge = $('profile-display-age');
  const profileDisplayGender = $('profile-display-gender');
  const profileDisplayNationality = $('profile-display-nationality');
  const selectedCountryFlag = $('selected-country-flag');
  const countryOptions = $('country-options');
  const profileDetails = $('profile-details');
  const profileBlockedUsers = $('profile-blocked-users');
  const profileBlockedUsersToggle = $('profile-blocked-users-toggle');
  const profileBlockedUsersCount = $('profile-blocked-users-count');
  const profileBlockedUsersList = $('profile-blocked-users-list');
  const profileUserActions = $('profile-user-actions');
  const profileChatBtn = $('profile-chat-btn');
  const profileBlockSection = $('profile-block-section');
  const blockConfirmModal = $('block-confirm-modal');
  const blockConfirmUserName = $('block-confirm-user-name');
  const directoryTitle = $('directory-title');
  const directoryStatus = $('directory-status');
  const profileEditBtn = $('profile-edit-btn');
  const profileForm = $('profile-form');
  const attachmentInput = $('attachment-input');
  const voiceBtn = $('voice-btn');
  const chatInputArea = $('chat-input-area');
  const voiceRecordingBar = $('voice-recording-bar');
  const voiceRecordingHint = $('voice-recording-hint');
  const voiceRecordingTimer = $('voice-recording-timer');
  const voiceRecordingLock = $('voice-recording-lock');
  const voicePreviewBar = $('voice-preview-bar');
  const voicePreviewAudio = $('voice-preview-audio');
  const chatMoreMenu = $('chat-more-menu');
  let currentAppView = 'home';
  let pendingProfileAvatar = null;
  let pendingProfileAvatarPromise = null;
  let originalProfileAvatar = null;
  let pendingBlockUser = null;
  let recordingStream = null;
  let recordingStartedAt = 0;
  let recordingTimer = null;
  let recordingLocked = false;
  let recordingCancelled = false;
  let recordingPointerId = null;
  let recordingStartX = 0;
  let recordingPointerActive = false;
  let recordingStopAction = 'send';
  let recordingChatUser = null;
  let voicePreview = null;

  function getNavigationStack() {
    return history.state && history.state.mofchatStack
      ? history.state.mofchatStack
      : [currentAppView];
  }

  function pushAppView(view) {
    if (currentAppView === view) return;
    const stack = [...getNavigationStack(), view];
    history.pushState({ mofchat: true, mofchatView: view, mofchatStack: stack }, '', location.href);
    currentAppView = view;
  }

  function replaceAppView(view) {
    const stack = getNavigationStack();
    const nextStack = [...stack.slice(0, -1), view];
    history.replaceState({ mofchat: true, mofchatView: view, mofchatStack: nextStack }, '', location.href);
    currentAppView = view;
  }

  function applyAppView(view) {
    if (view !== 'chat' && currentAppView === 'chat') {
      currentChatUser = null;
      isTyping = false;
    }
    if (view !== 'profile') profileTargetUser = null;

    profilePage.style.display = view === 'profile' ? 'flex' : 'none';
    privateMessagesPage.style.display = view === 'private' ? 'flex' : 'none';
    publicChatPage.style.display = view === 'public' ? 'flex' : 'none';
    chatView.style.display = view === 'chat' ? 'flex' : 'none';
    document.body.style.overflow = view === 'profile' || view === 'private' || view === 'public' ? 'hidden' : '';
    if (view === 'private') renderPrivateMessages();
    if (view === 'public') renderPublicChat();
    currentAppView = view;
  }

  function goBackInApp() {
    if (currentAppView === 'home') {
      applyAppView('home');
    } else if (history.state && history.state.mofchat) {
      history.back();
    } else {
      applyAppView('home');
    }
  }

  window.addEventListener('popstate', event => {
    if (event.state && event.state.mofchat) {
      applyAppView(event.state.mofchatView || 'home');
    } else {
      applyAppView('home');
    }
  });
  if (!history.state || !history.state.mofchat) {
    history.replaceState(
      { mofchat: true, mofchatView: 'home', mofchatStack: ['home'] },
      '',
      location.href
    );
  }

  function getCountry(value) {
    return countries.find(country => country.code === value) ||
      countries.find(country => country.name === value) ||
      null;
  }

  function renderDrawerProfile() {
    if (!drawerProfileName || !drawerProfileAvatar) return;

    drawerProfileName.textContent = myProfile.name;
    drawerProfileAvatar.style.background = '';
    drawerProfileAvatar.innerHTML = getAvatarMarkup(myProfile);
  }

  function refreshMyProfileAvatarSurfaces() {
    renderDrawerProfile();
    if (typeof window._renderUsers === 'function') {
      window._renderUsers(searchInput.value);
    }
    if (profileTargetUser && profileTargetUser.id === myProfile.id) {
      renderProfileAvatar(myProfile);
    }
    if (currentChatUser && currentChatUser.id === myProfile.id) {
      chatAvatar.className = 'chat-avatar';
      chatAvatar.style.background = '';
      chatAvatar.innerHTML = getAvatarMarkup(myProfile);
    }
    if (privateMessagesPage.style.display !== 'none') {
      renderPrivateMessages();
    }
  }

  function setMyProfileAvatar(avatar, persist = false) {
    const nextAvatar = typeof avatar === 'string' ? avatar : '';
    myProfile.avatar = nextAvatar;
    users.forEach(user => {
      if (user === myProfile || user.id === myProfile.id) user.avatar = nextAvatar;
    });
    if (profileTargetUser && profileTargetUser.id === myProfile.id) {
      profileTargetUser.avatar = nextAvatar;
    }
    if (persist) saveMyProfile();
    refreshMyProfileAvatarSurfaces();
  }

  function readProfileAvatar(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error || new Error('تعذر قراءة الصورة'));
      reader.onload = () => {
        const source = new Image();
        source.onerror = () => reject(new Error('تعذر معالجة الصورة'));
        source.onload = () => {
          const maxSize = 640;
          const scale = Math.min(1, maxSize / Math.max(source.naturalWidth, source.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
          const context = canvas.getContext('2d');
          if (!context) {
            resolve(reader.result);
            return;
          }
          context.drawImage(source, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        source.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

   let pendingCardBg = '';
   let originalProfileCardBg = '';

   window._handleCardBgUpload = function(event) {
     const file = event.target.files && event.target.files[0];
     if (!file) return;
     readProfileAvatar(file).then(dataUrl => {
       pendingCardBg = dataUrl;
       showToast('تم اختيار خلفية البطاقة بنجاح');
     }).catch(() => {
       showToast('تعذر تحميل صورة الخلفية');
     });
   };

   window._clearCardBg = function() {
     pendingCardBg = '';
     myProfile.cardBg = '';
     users.forEach(user => {
       if (user === myProfile || user.id === myProfile.id) user.cardBg = '';
     });
     saveMyProfile();
     renderUsers(searchInput.value);
     showToast('تم إزالة خلفية البطاقة');
   };

   function saveMyProfile() {
    try {
      localStorage.setItem(myProfileStorageKey, JSON.stringify({
        name: myProfile.name,
        initials: myProfile.initials,
        bio: myProfile.bio || '',
        age: myProfile.age,
        gender: myProfile.gender,
        nationality: myProfile.nationality,
        countryCode: myProfile.countryCode,
        avatar: myProfile.avatar || '',
        cardBg: myProfile.cardBg || ''
      }));
    } catch (error) {
      // Keep the profile updated in memory if browser storage is unavailable.
    }
  }

  function restoreMyProfile() {
    try {
      const stored = JSON.parse(localStorage.getItem(myProfileStorageKey) || 'null');
      if (!stored || typeof stored !== 'object') return;

      if (typeof stored.name === 'string' && stored.name.trim()) myProfile.name = stored.name.trim();
      if (typeof stored.bio === 'string') myProfile.bio = stored.bio;
      if (typeof stored.age === 'string' || typeof stored.age === 'number') myProfile.age = stored.age;
      if (stored.gender === 'ذكر' || stored.gender === 'أنثى') myProfile.gender = stored.gender;
      if (typeof stored.avatar === 'string') myProfile.avatar = stored.avatar;
      if (typeof stored.cardBg === 'string') myProfile.cardBg = stored.cardBg || '1786370860128.png';

      const storedCountry = getCountry(stored.countryCode) || getCountry(stored.nationality);
      if (storedCountry) {
        myProfile.countryCode = storedCountry.code;
        myProfile.country = storedCountry;
        myProfile.nationality = storedCountry.name;
      } else if (typeof stored.nationality === 'string') {
        myProfile.nationality = stored.nationality;
      }

      myProfile.initials = myProfile.name.split(' ').map(namePart => namePart[0]).join('').slice(0, 3);
    } catch (error) {
      // Ignore invalid old storage and keep the default profile.
    }
  }

  function getBlockedUsersFor(user) {
    if (!user) return [];
    if (Array.isArray(user.blockedUsers)) return user.blockedUsers;
    const ownerKey = String(user.id);
    if (!blockedUsersByOwner.has(ownerKey)) blockedUsersByOwner.set(ownerKey, []);
    return blockedUsersByOwner.get(ownerKey);
  }

  function saveMyBlockedUsers() {
    try {
      localStorage.setItem(
        blockedUsersStorageKey,
        JSON.stringify(getBlockedUsersFor(myProfile))
      );
    } catch (error) {
      // Keep the in-memory block active if browser storage is unavailable.
    }
  }

  function restoreMyBlockedUsers() {
    try {
      const stored = JSON.parse(localStorage.getItem(blockedUsersStorageKey) || '[]');
      if (!Array.isArray(stored)) return;

      myProfile.blockedUsers = stored.filter(user => user && user.id !== undefined);
      myProfile.blockedUsers.forEach(user => blockedUsers.add(user.id));
      users = users.filter(user => !blockedUsers.has(user.id));
    } catch (error) {
      // Ignore invalid old storage and keep the clean in-memory state.
    }
  }

  function addBlockedUser(owner, blockedUser) {
    const blockedList = getBlockedUsersFor(owner);
    if (!blockedList.some(user => user.id === blockedUser.id)) {
      blockedList.push({ ...blockedUser });
      if (owner.id === myProfile.id) saveMyBlockedUsers();
    }
  }

  function getAvatarMarkup(user) {
    if (user.avatar) {
      return `<img class="avatar-image" src="${user.avatar}" alt="">`;
    }
    const isFemale = user.gender === 'أنثى';
    const defaultAvatar = isFemale ? embeddedWomanAvatar : embeddedManAvatar;
    return `<img class="avatar-image" src="${defaultAvatar}" alt="">`;
  }

  function renderCountryOptions(filter = '') {
    const normalizedFilter = filter.trim().toLowerCase();
    const filteredCountries = countries.filter(country =>
      !normalizedFilter ||
      country.name.toLowerCase().includes(normalizedFilter) ||
      country.code.toLowerCase().includes(normalizedFilter)
    );

    countryOptions.innerHTML = filteredCountries.map(country => `
      <button type="button" class="country-option" onclick="selectCountry('${country.code}')">
        <span class="country-option-flag">${country.flag}</span>
        <span>${country.name}</span>
      </button>
    `).join('') || '<div class="country-empty">لا توجد دولة بهذا الاسم</div>';
    countryOptions.classList.add('open');
  }

  window.selectCountry = function(code) {
    selectedCountry = getCountry(code);
    if (!selectedCountry) return;
    profileNationalityInput.value = selectedCountry.name;
    selectedCountryFlag.textContent = selectedCountry.flag;
    countryOptions.classList.remove('open');
  };

  window._openCountryPicker = function() {
    renderCountryOptions(profileNationalityInput.value);
  };

  window._filterCountries = function(value) {
    selectedCountry = null;
    selectedCountryFlag.textContent = '🌍';
    renderCountryOptions(value);
  };

  window._toggleCountryPicker = function(event) {
    event.preventDefault();
    event.stopPropagation();
    if (countryOptions.classList.contains('open')) {
      countryOptions.classList.remove('open');
    } else {
      renderCountryOptions(profileNationalityInput.value);
    }
  };

  function getTime() {
    const now = new Date();
    const hour = now.getHours();
    const hour12 = hour % 12 || 12;
    const period = hour >= 12 ? 'مساءً' : 'صباحًا';
    return `${hour12}:${now.getMinutes().toString().padStart(2, '0')} ${period}`;
  }

  function showToast(text) {
    toastText.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function isFeaturedUser(user, now = Date.now()) {
    const isActiveUser = user && users.some(activeUser => activeUser.id === user.id);
    return Boolean(isActiveUser && user.connectedAt && now - user.connectedAt >= featuredAfterMs);
  }

  function getUserBadgeMarkup(user, now = Date.now()) {
    if (isFeaturedUser(user, now)) {
      return '<span class="user-badge badge-vip">VIP</span>';
    }
    return '';
  }

  function generateId() { return Date.now() + Math.random().toString(36).substr(2, 9); }

  function containsCode(text) {
    if (!text || typeof text !== 'string') return false;

    // Check for HTML/XML markup tags or code tags
    if (/<\/?(?:script|style|html|body|head|div|span|p|a|iframe|input|button|form|meta|link|code|pre|svg|img|object|embed|audio|video)[^>]*>/i.test(text)) {
      return true;
    }

    // Check for inline event handlers or tag elements
    if (/<[a-z0-9-]+[^>]*>/i.test(text) || /\bon\w+\s*=/i.test(text)) {
      return true;
    }

    // Check for common programming language keywords and code constructs
    const codePatterns = [
      /\b(function|const|let|var|import|export|class|return|if|else|switch|case|while|for|try|catch|async|await)\b[\s\({;=]/i,
      /document\.(getElementById|querySelector|getElementsBy|createElement|body|cookie|innerHTML)/i,
      /window\.(location|alert|eval|localStorage|sessionStorage|addEventListener)/i,
      /\b(console\.log|console\.error|console\.warn|eval\(|exec\(|alert\()\b/i,
      /<\?php|<\?=|\bSELECT\s+.*\s+FROM\b|\bINSERT\s+INTO\b|\bUPDATE\s+.*\s+SET\b/i,
      /([a-zA-Z_$][\w_$]*)\s*\([^)]*\)\s*\{/,
      /=>\s*[\{\(]/,
      /#include\s*<[a-z0-9_.]+|#include\s*"[a-z0-9_.]+"/i,
      /\b(def|lambda)\s+\w+\s*\(|\bimport\s+(sys|os|json|re|math)\b/i
    ];

    return codePatterns.some(pattern => pattern.test(text));
  }

  function savePublicMessages() {
    try {
      localStorage.setItem(publicMessagesStorageKey, JSON.stringify(publicMessages.slice(-35)));
    } catch (error) {
      showToast('تعذر حفظ الرسالة، مساحة التخزين ممتلئة');
    }
  }

  function restorePublicMessages() {
    try {
      const stored = JSON.parse(localStorage.getItem(publicMessagesStorageKey) || 'null');
      if (Array.isArray(stored) && stored.length) {
        publicMessages = stored
          .filter(message => message && typeof message === 'object' && message.text !== undefined)
          .map(({ mediaUrl, mediaType, ...message }) => message)
          .slice(-35);
      }
    } catch (error) {
      // Keep the welcome messages if storage is unavailable or invalid.
    }
  }

  function escapePublicText(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[character]));
  }

  function getPublicMessageUser(message) {
    if (message.from === 'me') {
      return myProfile;
    }
    const existingUser = users.find(u => u.name === message.name);
    return {
      name: message.name || 'مستخدم',
      initials: message.initials || 'م',
      color: message.color || '#7c3aed',
      avatar: message.avatar || (existingUser ? existingUser.avatar : ''),
      gender: message.gender || (existingUser ? existingUser.gender : (message.name && (message.name.includes('سارة') || message.name.includes('ليلى') || message.name.includes('فاطمة') || message.name.includes('نور') || message.name.includes('ريم') || message.name.includes('هند') || message.name.includes('هدى') || message.name.includes('مريم') || message.name.includes('زينب') || message.name.includes('آية')) ? 'أنثى' : 'ذكر'))
    };
  }

  function getPublicAvatarMarkup(user) {
    if (user && user.avatar) {
      return `<img class="public-avatar-image" src="${escapePublicText(user.avatar)}" alt="">`;
    }
    const isFemale = (user && user.gender) === 'أنثى';
    const defaultAvatar = isFemale ? embeddedWomanAvatar : embeddedManAvatar;
    return `<img class="public-avatar-image" src="${defaultAvatar}" alt="">`;
  }

  function renderPublicRoomPreview() {
    if (!publicRoomPreviewMessages) return;
    const preview = publicMessages.slice(-2);
    publicRoomPreviewMessages.innerHTML = preview.map(message => {
      const user = getPublicMessageUser(message);
      const bgStyle = user && user.avatar ? 'background: transparent;' : `background:${escapePublicText(user.color)};`;
      return `
        <article class="room-message${message.featured ? ' room-message-featured' : ''}">
          <span class="room-message-avatar" style="${bgStyle}">${getPublicAvatarMarkup(user)}</span>
          <div><strong>${escapePublicText(user.name)}</strong><p>${escapePublicText(message.text)}</p><time>${escapePublicText(message.time || 'الآن')}</time></div>
        </article>
      `;
    }).join('');
  }

  function renderPublicChat() {
    if (!publicChatMessages) return;
    publicChatMessages.innerHTML = publicMessages.map((message, index) => {
      const user = getPublicMessageUser(message);
      const isMine = message.from === 'me';
      const bgStyle = user && user.avatar ? 'background: transparent;' : `background:${escapePublicText(user.color)};`;
      return `
        <article class="public-message ${isMine ? 'mine' : ''}" style="animation-delay:${Math.min(index, 8) * 0.035}s">
          <span class="public-message-avatar" style="${bgStyle}">${getPublicAvatarMarkup(user)}</span>
          <div class="public-message-body">
            <div class="public-message-meta"><strong>${escapePublicText(user.name)}</strong><time>${escapePublicText(message.time || 'الآن')}</time></div>
            <p>${escapePublicText(message.text)}</p>
          </div>
        </article>
      `;
    }).join('');
    publicChatMessages.scrollTop = publicChatMessages.scrollHeight;
    renderPublicRoomPreview();
  }

  function addPublicMessage(message) {
    if (message && message.text && containsCode(message.text)) {
      return;
    }
    publicMessages.push({
      id: generateId(),
      time: getTime(),
      ...message
    });
    publicMessages = publicMessages.slice(-35);
    savePublicMessages();
    renderPublicChat();
  }

  function createFeaturedMenuItem() {
    const item = document.createElement('div');
    item.className = 'drawer-menu-item featured-menu-item';
    item.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>
      </svg>
      المستخدمون المميزون
    `;
    item.addEventListener('click', () => {
      window._showFeaturedUsers();
      window._closeDrawer();
    });
    return item;
  }

  function createPublicMenuItem() {
    const item = document.createElement('div');
    item.className = 'drawer-menu-item public-menu-item';
    item.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.7 8.7 0 0 1-4-.9L3 21l1.9-4.1A8.4 8.4 0 0 1 3 11.5a8.5 8.5 0 0 1 18 0Z"/>
        <path d="M8 11h.01M12 11h.01M16 11h.01"/>
      </svg>
      المحادثة العامة
    `;
    item.addEventListener('click', () => {
      window._openPublicChat();
      window._closeDrawer();
    });
    return item;
  }

  function configureDrawerMenu() {
    if (!drawerMenu) return;
    const sections = Array.from(drawerMenu.querySelectorAll('.drawer-menu-section'));
    const items = Array.from(drawerMenu.querySelectorAll('.drawer-menu-item'));
    const findItem = label => items.find(item => item.textContent.includes(label));
    const accountItem = findItem('حسابي');
    const homeItem = findItem('الرئيسية');
    const settingsItem = findItem('الإعدادات');
    const logoutItem = findItem('تسجيل الخروج');
    if (!accountItem || !homeItem || !settingsItem || !logoutItem) return;

    const firstSection = sections[0];
    sections.slice(1).forEach(section => section.remove());
    const title = firstSection.querySelector('.drawer-menu-title');
    firstSection.innerHTML = '';
    if (title) {
      title.textContent = 'القائمة';
      firstSection.appendChild(title);
    }

    const featuredItem = createFeaturedMenuItem();
    const publicItem = createPublicMenuItem();
    const orderedItems = [accountItem, homeItem, publicItem, featuredItem, settingsItem, logoutItem];
    orderedItems.forEach(item => {
      if (item !== featuredItem) item.removeAttribute('onclick');
      firstSection.appendChild(item);
    });
    accountItem.addEventListener('click', () => {
      window._closeDrawer();
      window._openMyProfile();
    });
    homeItem.addEventListener('click', () => {
      window._showHome();
      window._closeDrawer();
    });
    settingsItem.addEventListener('click', () => window._closeDrawer());
    logoutItem.addEventListener('click', () => window._closeDrawer());
  }

  function formatConnectionDuration(user) {
    const minutes = Math.max(0, Math.floor((Date.now() - user.connectedAt) / 60000));
    if (minutes < 60) return `${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours} س و ${remainingMinutes} د` : `${hours} ساعة`;
  }

  function refreshActivityState() {
    if (document.hidden) return;
    const now = Date.now();
    let activityWasReset = false;
    users.forEach(user => {
      if (!user.lastActivityAt || now - user.lastActivityAt >= inactiveResetMs) {
        user.connectedAt = now;
        activityWasReset = true;
      }
      user.lastActivityAt = now;
    });
    if (activityWasReset) refreshVipDisplays(isFeaturedView);
  }

  function removeExpiredOfflineUsers() {
    const now = Date.now();
    const expiredIds = new Set(
      users
        .filter(user => user.offlineSince && now - user.offlineSince >= offlineGraceMs)
        .map(user => user.id)
    );

    if (!expiredIds.size) return;

    users = users.filter(user => !expiredIds.has(user.id));
    if (currentChatUser && expiredIds.has(currentChatUser.id)) {
      chatStatusText.textContent = 'غير متصل';
      chatStatus.classList.remove('typing');
    }
    window._renderUsers(searchInput.value);
  }

  window._showHome = function() {
    isFeaturedView = false;
    const mainHeader = document.getElementById('main-header');
    const featuredHeader = document.getElementById('featured-header');
    if (mainHeader) mainHeader.style.display = '';
    if (featuredHeader) featuredHeader.style.display = 'none';
    if (directoryTitle) directoryTitle.textContent = 'المتصلون الآن';
    if (directoryStatus) directoryStatus.innerHTML = '<span class="dot"></span>مباشر';
    window._renderUsers(searchInput.value);
  };

  window._showFeaturedUsers = function() {
    isFeaturedView = true;
    const mainHeader = document.getElementById('main-header');
    const featuredHeader = document.getElementById('featured-header');
    if (mainHeader) mainHeader.style.display = 'none';
    if (featuredHeader) featuredHeader.style.display = '';
    if (directoryTitle) directoryTitle.textContent = 'المستخدمون المميزون';
    if (directoryStatus) directoryStatus.innerHTML = '<span class="dot"></span>مباشر';
    window._renderUsers(searchInput.value);
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      appHiddenAt = Date.now();
      myProfile.offlineSince = appHiddenAt;
      return;
    }

    const hiddenDuration = appHiddenAt ? Date.now() - appHiddenAt : 0;
    if (hiddenDuration >= offlineGraceMs) {
      users = users.filter(user => user.id !== myProfile.id);
      window._renderUsers(searchInput.value);
    }
    appHiddenAt = null;
    myProfile.offlineSince = null;
    if (!users.some(user => user.id === myProfile.id)) {
      myProfile.connectedAt = Date.now();
      myProfile.lastActivityAt = Date.now();
      myProfile.joinedAt = Date.now();
      users.unshift(myProfile);
      window._renderUsers(searchInput.value);
    }
    refreshActivityState();
  });

  window._openDrawer = function() {
    drawerOverlay.classList.add('active');
    sideDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window._closeDrawer = function() {
    drawerOverlay.classList.remove('active');
    sideDrawer.classList.remove('active');
    document.body.style.overflow = '';
  };

  window._openPrivateMessages = function() {
    pushAppView('private');
    privateMessagesPage.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderPrivateMessages();
  };

  window._closePrivateMessages = function() {
    goBackInApp();
  };

  window._openPublicChat = function() {
    pushAppView('public');
    publicChatPage.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderPublicChat();
    requestAnimationFrame(() => publicMsgInput && publicMsgInput.focus());
  };

  window._closePublicChat = function() {
    goBackInApp();
  };

  window._sendPublicMessage = function() {
    const text = publicMsgInput && publicMsgInput.value.trim();
    if (!text) return;

    if (containsCode(text)) {
      showToast('عذراً، غير مسموح بإرسال الأكواد البرمجية');
      return;
    }

    const isDuplicate = publicMessages.some(m => m.text && m.text.trim().toLowerCase() === text.toLowerCase());
    if (isDuplicate) {
      showToast('عذراً، لا يمكن تكرار الرسائل في المحادثة العامة');
      return;
    }

    addPublicMessage({
      from: 'me',
      name: myProfile.name,
      initials: myProfile.initials,
      color: myProfile.color,
      text
    });
    publicMsgInput.value = '';
    publicMsgInput.focus();
  };

  window._editProfile = function() {
    window._openMyProfile();
  };

  window._updateProfileName = function(value) {
    const newName = value.trim();
    if (newName) {
      showToast('تم تحديث الاسم إلى: ' + newName);
      const names = newName.split(' ');
      const initials = names.map(n => n[0]).join('');
      myProfile.name = newName;
      myProfile.initials = initials.slice(0, 3);
      saveMyProfile();
      renderDrawerProfile();
    }
  };

  function renderProfileAvatar(user) {
    profileAvatar.textContent = '';
    profileAvatar.style.background = '';
    profileAvatar.className = `profile-avatar ${user.avatar ? '' : user.gender === 'أنثى' ? 'avatar-placeholder female' : 'avatar-placeholder male'}`;
    profileAvatar.innerHTML = getAvatarMarkup(user);
  }

  function renderProfile(user) {
    user = isCurrentUser(user) ? myProfile : user;
    const profileCountry = user.country || getCountry(user.countryCode) || getCountry(user.nationality);
    const isMine = user.id === myProfile.id;
    selectedCountry = profileCountry;
    profileNameInput.value = user.name || '';
    const today = new Date();
    const max16 = new Date();
    max16.setFullYear(today.getFullYear() - 16);
    const maxStr = max16.toISOString().split('T')[0];
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(today.getFullYear() - 100);
    const minStr = hundredYearsAgo.toISOString().split('T')[0];
    profileAgeInput.max = maxStr;
    profileAgeInput.min = minStr;
    if (user.age && !isNaN(Number(user.age))) {
      const birthYear = today.getFullYear() - Number(user.age);
      profileAgeInput.value = `${birthYear}-01-01`;
    } else {
      profileAgeInput.value = user.age || '';
    }
    profileGenderInput.value = user.gender || '';
    profileNationalityInput.value = profileCountry ? profileCountry.name : (user.nationality || '');
    selectedCountryFlag.textContent = profileCountry ? profileCountry.flag : '🌍';
    profileDisplayName.textContent = user.name || 'مستخدم';
    profileDisplayBadge.innerHTML = getUserBadgeMarkup(user);
    profileDisplayBio.textContent = user.bio || 'اكتب شيئًا عن نفسك';
    profileDisplayAge.textContent = user.age || 'غير محدد';
    profileDisplayGender.textContent = user.gender || 'غير محدد';
    profileDisplayNationality.textContent = profileCountry ? profileCountry.name : (user.nationality || 'غير محدد');
    if (profileBlockedUsers) profileBlockedUsers.style.display = isMine ? 'block' : 'none';
    if (isMine) renderProfileBlockedUsers(user);
    profileEditBtn.style.display = isMine ? 'flex' : 'none';
    profileUserActions.style.display = isMine ? 'none' : 'flex';
    profileChatBtn.style.display = isMine ? 'none' : 'flex';
    if (profileBlockSection) profileBlockSection.style.display = isMine ? 'none' : 'block';
    profileForm.style.display = 'none';
    profileDetails.style.display = 'flex';
    if (profileBlockedUsers) profileBlockedUsers.style.display = isMine ? 'block' : 'none';
    const wrap = $('profile-avatar-wrap');
    if (wrap) wrap.classList.remove('editable');
    const overlay = $('profile-avatar-edit-overlay');
    if (overlay) overlay.style.display = 'none';
    if (profileTargetUser && profileTargetUser.id === myProfile.id) {
      pendingProfileAvatar = myProfile.avatar || null;
    }
    renderProfileAvatar(user);
  }

  function renderProfileBlockedUsers(user, keepOpen = false) {
    if (!profileBlockedUsersCount || !profileBlockedUsersList || !profileBlockedUsersToggle) return;
    const wasOpen = keepOpen && profileBlockedUsersList.classList.contains('open');
    const blockedList = getBlockedUsersFor(user);
    profileBlockedUsersCount.textContent = blockedList.length;
    profileBlockedUsersToggle.setAttribute('aria-expanded', String(wasOpen));
    profileBlockedUsersList.classList.toggle('open', wasOpen);
    profileBlockedUsersList.innerHTML = blockedList.length
      ? blockedList.map(blockedUser => `
          <div class="profile-blocked-user">
            <div class="profile-blocked-user-avatar">${getAvatarMarkup(blockedUser)}</div>
            <span class="profile-blocked-user-name">${blockedUser.name || 'مستخدم'}</span>
            <button type="button" class="profile-unblock-btn" data-unblock-user="${blockedUser.id}" aria-label="فك حظر ${blockedUser.name || 'المستخدم'}">فك الحظر</button>
          </div>
        `).join('')
      : '<div class="profile-blocked-empty">لا يوجد مستخدمون محظورون</div>';

    profileBlockedUsersList.querySelectorAll('[data-unblock-user]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        window._unblockProfileUser(button.dataset.unblockUser);
      });
    });
  }

  window._toggleProfileBlockedUsers = function() {
    if (!profileBlockedUsersList || !profileBlockedUsersToggle) return;
    const isOpen = profileBlockedUsersList.classList.toggle('open');
    profileBlockedUsersToggle.setAttribute('aria-expanded', String(isOpen));
  };

  window._unblockProfileUser = function(userId) {
    if (!profileTargetUser) return;
    const blockedList = getBlockedUsersFor(profileTargetUser);
    const blockedIndex = blockedList.findIndex(user => String(user.id) === String(userId));
    if (blockedIndex === -1) return;

    const [unblockedUser] = blockedList.splice(blockedIndex, 1);
    if (profileTargetUser.id === myProfile.id) {
      blockedUsers.delete(unblockedUser.id);
      saveMyBlockedUsers();
      if (!users.some(user => user.id === unblockedUser.id)) {
        unblockedUser.lastSeen = 'الآن';
        unblockedUser.connectedAt = Date.now();
        unblockedUser.lastActivityAt = Date.now();
        users.unshift(unblockedUser);
      }
      window._renderUsers(searchInput.value);
    }

    renderProfileBlockedUsers(profileTargetUser, true);
    showToast('تم فك الحظر عن ' + (unblockedUser.name || 'المستخدم'));
  };

  window._openUserProfile = function(user) {
    profileTargetUser = user;
    pushAppView('profile');
    renderProfile(user);
    profilePage.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window._openMyProfile = function() {
    window._closeDrawer();
    window._openUserProfile(myProfile);
  };

  window._openProfileChat = function() {
    if (!profileTargetUser || profileTargetUser.id === myProfile.id) return;
    const user = users.find(item => item.id === profileTargetUser.id) || profileTargetUser;
    profilePage.style.display = 'none';
    document.body.style.overflow = '';
    window._openChat(user);
  };

  function showBlockConfirmation(user) {
    if (!user || user.id === myProfile.id) return;
    pendingBlockUser = user;
    if (blockConfirmUserName) blockConfirmUserName.textContent = user.name || 'هذا المستخدم';
    if (blockConfirmModal) blockConfirmModal.style.display = 'flex';
  }

  function hideBlockConfirmation() {
    pendingBlockUser = null;
    if (blockConfirmModal) blockConfirmModal.style.display = 'none';
  }

  function executeBlockUser(blockedUser) {
    if (!blockedUser || blockedUser.id === myProfile.id) {
      hideBlockConfirmation();
      return;
    }
    blockedUsers.add(blockedUser.id);
    addBlockedUser(myProfile, blockedUser);
    users = users.filter(user => user.id !== blockedUser.id);
    if (currentChatUser && currentChatUser.id === blockedUser.id) {
      chatMoreMenu.classList.remove('open');
      window._closeChat();
    } else if (profileTargetUser && profileTargetUser.id === blockedUser.id) {
      window._closeProfile();
    }
    hideBlockConfirmation();
    showToast('تم حظر ' + (blockedUser.name || 'المستخدم'));
    refreshVipDisplays(true);
  }

  window._blockProfileUser = function() {
    showBlockConfirmation(profileTargetUser);
  };

  window._confirmBlockUser = function() {
    executeBlockUser(pendingBlockUser);
  };

  window._askBlockProfileUser = function() {
    showBlockConfirmation(profileTargetUser);
  };

  window._cancelBlockProfileUser = function() {
    hideBlockConfirmation();
  };

  window._closeProfile = function() {
    goBackInApp();
  };

  window._chooseProfileImage = function() {
    if (profileTargetUser && profileTargetUser.id === myProfile.id) {
      profileAvatarInput.click();
    }
  };

  window._editMyProfile = function() {
    if (!profileTargetUser || profileTargetUser.id !== myProfile.id) return;
    profileDetails.style.display = 'none';
    if (profileBlockedUsers) profileBlockedUsers.style.display = 'none';
    profileEditBtn.style.display = 'none';
    profileForm.style.display = 'flex';
    originalProfileAvatar = myProfile.avatar || '';
    pendingProfileAvatar = profileTargetUser.avatar || null;
    pendingProfileAvatarPromise = null;
    profileBioInput.value = profileTargetUser.bio || '';
    updateEditAvatarPreview();
  };

  window._cancelProfileEdit = function() {
    if (!profileTargetUser) return;
    setMyProfileAvatar(originalProfileAvatar || '', true);
    pendingProfileAvatar = originalProfileAvatar || null;
    pendingProfileAvatarPromise = null;
    if (profileAvatarInput) profileAvatarInput.value = '';
    renderProfile(profileTargetUser);
  };

  function updateEditAvatarPreview() {
    const wrap = $('profile-avatar-wrap');
    if (wrap) wrap.classList.add('editable');
    const overlay = $('profile-avatar-edit-overlay');
    if (overlay) overlay.style.display = 'flex';
    const tempUser = { avatar: pendingProfileAvatar || profileTargetUser.avatar, gender: profileTargetUser.gender };
    renderProfileAvatar(tempUser);
  }

  window.checkProfileAvatarClick = function() {
    if (profileTargetUser && profileTargetUser.id === myProfile.id && profileForm.style.display === 'flex') {
      profileAvatarInput.click();
    }
  };

  const avatarCropModal = $('avatar-crop-modal');
  const cropViewport = $('crop-viewport');
  const cropSourceImage = $('crop-source-image');
  const cropZoomSlider = $('crop-zoom-slider');
  let cropZoom = 1;
  let cropX = 0;
  let cropY = 0;
  let baseCropScale = 1;
  let isDraggingCrop = false;
  let startCropX = 0;
  let startCropY = 0;

  function updateCropImageTransform() {
    if (!cropSourceImage || !cropSourceImage.naturalWidth) return;
    const currentScale = baseCropScale * cropZoom;
    const viewportSize = 240;
    const imgW = cropSourceImage.naturalWidth * currentScale;
    const imgH = cropSourceImage.naturalHeight * currentScale;
    const maxOffsetX = Math.max(0, (imgW - viewportSize) / 2);
    const maxOffsetY = Math.max(0, (imgH - viewportSize) / 2);
    cropX = Math.max(-maxOffsetX, Math.min(maxOffsetX, cropX));
    cropY = Math.max(-maxOffsetY, Math.min(maxOffsetY, cropY));
    cropSourceImage.style.transform = `translate(-50%, -50%) translate(${cropX}px, ${cropY}px) scale(${currentScale})`;
  }

  function openAvatarCropModal(dataUrl) {
    cropZoom = 1;
    cropX = 0;
    cropY = 0;
    if (cropZoomSlider) cropZoomSlider.value = 1;
    if (cropSourceImage) {
      cropSourceImage.onload = () => {
        const viewportSize = 240;
        baseCropScale = Math.max(viewportSize / cropSourceImage.naturalWidth, viewportSize / cropSourceImage.naturalHeight);
        updateCropImageTransform();
      };
      cropSourceImage.src = dataUrl;
    }
    if (avatarCropModal) avatarCropModal.style.display = 'flex';
  }

  window.closeAvatarCropModal = function() {
    if (avatarCropModal) avatarCropModal.style.display = 'none';
    if (profileAvatarInput) profileAvatarInput.value = '';
  };

  window.cancelAvatarCrop = function() {
    window.closeAvatarCropModal();
    showToast('تم إلغاء تعديل الصورة');
  };

  window.confirmAvatarCrop = function() {
    if (!cropSourceImage || !cropSourceImage.naturalWidth) {
      window.closeAvatarCropModal();
      return;
    }
    const canvas = document.createElement('canvas');
    const outputSize = 512;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      window.closeAvatarCropModal();
      return;
    }

    const viewportSize = 240;
    const currentScale = baseCropScale * cropZoom;

    // Calculate source rect corresponding to the viewport circle
    const srcW = viewportSize / currentScale;
    const srcH = viewportSize / currentScale;
    const srcX = (cropSourceImage.naturalWidth / 2) - (srcW / 2) - (cropX / currentScale);
    const srcY = (cropSourceImage.naturalHeight / 2) - (srcH / 2) - (cropY / currentScale);

    ctx.clearRect(0, 0, outputSize, outputSize);

    // Draw full circular output without padding/transparent borders
    ctx.save();
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(
      cropSourceImage,
      srcX, srcY, srcW, srcH,
      0, 0, outputSize, outputSize
    );
    ctx.restore();

    // Now, create a secondary canvas to trim any extra outer transparent pixels if any, or export crisp circular image
    const croppedDataUrl = canvas.toDataURL('image/png', 0.95);
    pendingProfileAvatar = croppedDataUrl;
    setMyProfileAvatar(pendingProfileAvatar, true);
    updateEditAvatarPreview();
    window.closeAvatarCropModal();
    showToast('تم تعيين وتأكيد الصورة الشخصية بنجاح');
  };

  if (cropViewport) {
    cropViewport.addEventListener('mousedown', (e) => {
      isDraggingCrop = true;
      startCropX = e.clientX - cropX;
      startCropY = e.clientY - cropY;
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDraggingCrop) return;
      cropX = e.clientX - startCropX;
      cropY = e.clientY - startCropY;
      updateCropImageTransform();
    });
    window.addEventListener('mouseup', () => {
      isDraggingCrop = false;
    });

    cropViewport.addEventListener('touchstart', (e) => {
      if (!e.touches[0]) return;
      isDraggingCrop = true;
      startCropX = e.touches[0].clientX - cropX;
      startCropY = e.touches[0].clientY - startCropY;
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (!isDraggingCrop || !e.touches[0]) return;
      cropX = e.touches[0].clientX - startCropX;
      cropY = e.touches[0].clientY - startCropY;
      updateCropImageTransform();
    }, { passive: true });
    window.addEventListener('touchend', () => {
      isDraggingCrop = false;
    });
  }

  if (cropZoomSlider) {
    cropZoomSlider.addEventListener('input', (e) => {
      cropZoom = parseFloat(e.target.value) || 1;
      updateCropImageTransform();
    });
  }

  profileAvatarInput.addEventListener('change', function() {
    const file = profileAvatarInput.files && profileAvatarInput.files[0];
    if (!file || !profileTargetUser) return;
    readProfileAvatar(file).then(dataUrl => {
      openAvatarCropModal(dataUrl);
    }).catch(() => {
      showToast('تعذر قراءة الصورة، حاول مرة أخرى');
      profileAvatarInput.value = '';
    });
  });

  profileAgeInput.addEventListener('change', function() {
    const ageVal = profileAgeInput.value.trim();
    if (!ageVal) return;
    let ageNum = '';
    if (ageVal.includes('-')) {
      const birthDate = new Date(ageVal);
      const today = new Date();
      ageNum = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        ageNum--;
      }
    } else {
      ageNum = Number(ageVal);
    }
    if (isNaN(ageNum) || ageNum < 16) {
      showToast('العمر أقل من 16 سنة.');
      profileAgeInput.value = '';
    }
  });

  window._saveProfile = async function() {
    if (!profileTargetUser) return;
    if (pendingProfileAvatarPromise) {
      try {
        await pendingProfileAvatarPromise;
      } catch (error) {
        return;
      }
    }
    const newName = profileNameInput.value.trim();
    if (!newName) {
      showToast('اكتب الاسم أولاً');
      return;
    }

    profileTargetUser.name = newName;
    profileTargetUser.bio = profileBioInput.value.trim();
    profileTargetUser.avatar = pendingProfileAvatar || '';
    const ageVal = profileAgeInput.value.trim();
    if (ageVal) {
      let ageNum = '';
      if (ageVal.includes('-')) {
        const birthDate = new Date(ageVal);
        const today = new Date();
        ageNum = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          ageNum--;
        }
      } else {
        ageNum = Number(ageVal);
      }
      if (isNaN(ageNum) || ageNum < 16) {
        showToast('العمر أقل من 16 سنة.');
        return;
      }
      profileTargetUser.age = Math.max(16, Math.min(100, ageNum));
    } else {
      profileTargetUser.age = '';
    }
    profileTargetUser.gender = profileGenderInput.value;
    const chosenCountry = selectedCountry || getCountry(profileNationalityInput.value.trim());
    if (profileNationalityInput.value.trim() && !chosenCountry) {
      showToast('اختر دولة من القائمة');
      return;
    }
    profileTargetUser.nationality = chosenCountry ? chosenCountry.name : '';
    profileTargetUser.countryCode = chosenCountry ? chosenCountry.code : '';
    profileTargetUser.country = chosenCountry || null;
    profileTargetUser.initials = newName.split(' ').map(n => n[0]).join('').slice(0, 3);

    if (pendingCardBg) {
      profileTargetUser.cardBg = pendingCardBg;
    }
    if (profileTargetUser.id === myProfile.id) {
      myProfile.cardBg = profileTargetUser.cardBg || myProfile.cardBg || '1786370860128.png';
      setMyProfileAvatar(profileTargetUser.avatar, true);
      saveMyProfile();
      renderProfile(profileTargetUser);
      renderUsers(searchInput.value);
    } else {
      window._renderUsers(searchInput.value);
    }
    showToast('تم حفظ بيانات الملف الشخصي');
  };

  window._toggleChatMenu = function(event) {
    event.stopPropagation();
    chatMoreMenu.classList.toggle('open');
  };

  window._openChatProfileFromMenu = function() {
    chatMoreMenu.classList.remove('open');
    if (currentChatUser) window._openUserProfile(currentChatUser);
  };

  window._blockCurrentUser = function() {
    showBlockConfirmation(currentChatUser);
  };

  document.addEventListener('click', event => {
    if (!event.target.closest('.chat-header-actions')) chatMoreMenu.classList.remove('open');
    if (!event.target.closest('.profile-field')) countryOptions.classList.remove('open');
  });

  window._chooseAttachment = function() {
    if (!currentChatUser) return;
    attachmentInput.click();
  };

  attachmentInput.addEventListener('change', function() {
    const file = attachmentInput.files && attachmentInput.files[0];
    if (!file || !currentChatUser) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      showToast('يمكن إرسال الصور والفيديو فقط');
      attachmentInput.value = '';
      return;
    }
    messages[currentChatUser.id].push({
      id: generateId(),
      from: 'me',
      text: file.name,
      time: getTime(),
      read: false,
      type: 'media',
      mediaUrl: URL.createObjectURL(file),
      mediaType: file.type
    });
    messages[currentChatUser.id] = messages[currentChatUser.id].slice(-70);
    syncPrivateMessageSummary(currentChatUser);
    currentChatUser.msgCount++;
    renderMessages();
    showToast('تم إرفاق الملف: ' + file.name);
    attachmentInput.value = '';
  });

  function formatVoiceDuration(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function updateVoiceRecordingTimer() {
    if (!recordingStartedAt || !voiceRecordingTimer) return;
    voiceRecordingTimer.textContent = formatVoiceDuration(Date.now() - recordingStartedAt);
  }

  function setVoiceInputMode(mode) {
    chatInputArea.classList.toggle('is-recording', mode === 'recording');
    chatInputArea.classList.toggle('is-voice-preview', mode === 'preview');
    voiceRecordingBar.style.display = mode === 'recording' ? 'flex' : 'none';
    voicePreviewBar.style.display = mode === 'preview' ? 'flex' : 'none';
    if (mode === 'normal') {
      voiceBtn.classList.remove('recording', 'locked', 'canceling');
      voiceBtn.title = 'تسجيل صوتي';
      voiceRecordingTimer.textContent = '00:00';
    }
  }

  function clearRecordingState() {
    if (recordingTimer) {
      clearInterval(recordingTimer);
      recordingTimer = null;
    }
    if (recordingStream) {
      recordingStream.getTracks().forEach(track => track.stop());
      recordingStream = null;
    }
    mediaRecorder = null;
    isRecording = false;
    recordingLocked = false;
    recordingCancelled = false;
    recordingPointerId = null;
    recordingPointerActive = false;
    recordingStartedAt = 0;
    recordingStopAction = 'send';
    recordingChatUser = null;
    voiceBtn.classList.remove('recording', 'locked', 'canceling');
    setVoiceInputMode('normal');
  }

  function sendAudioMessage(audioBlob, chatUser, duration) {
    if (!audioBlob || !chatUser || !messages[chatUser.id]) return;
    const audioUrl = URL.createObjectURL(audioBlob);
    messages[chatUser.id].push({
      id: generateId(),
      from: 'me',
      text: 'تسجيل صوتي',
      audioUrl,
      time: getTime(),
      read: false,
      type: 'audio',
      duration
    });
    messages[chatUser.id] = messages[chatUser.id].slice(-70);
    syncPrivateMessageSummary(chatUser);
    chatUser.msgCount++;
    if (currentChatUser && currentChatUser.id === chatUser.id) renderMessages();
    showToast('تم إرسال التسجيل الصوتي');
  }

  function clearVoicePreview() {
    if (voicePreview && voicePreview.url) URL.revokeObjectURL(voicePreview.url);
    voicePreview = null;
    voicePreviewAudio.removeAttribute('src');
    voicePreviewAudio.load();
    setVoiceInputMode('normal');
  }

  function stopVoiceRecording(action) {
    if (!isRecording || !mediaRecorder) return;
    recordingStopAction = action;
    if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  }

  async function startVoiceRecording() {
    if (!currentChatUser || isRecording || voicePreview) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      showToast('التسجيل الصوتي غير مدعوم على هذا الجهاز');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!recordingPointerActive || !currentChatUser) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      recordingStream = stream;
      recordingChatUser = currentChatUser;
      audioChunks = [];
      recordingStartedAt = Date.now();
      recordingStopAction = 'send';
      recordingCancelled = false;
      recordingLocked = false;
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ].find(type => MediaRecorder.isTypeSupported(type)) || '';
      mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const blobType = mediaRecorder && mediaRecorder.mimeType
          ? mediaRecorder.mimeType
          : (mimeType || 'audio/webm');
        const audioBlob = new Blob(audioChunks, { type: blobType });
        const duration = formatVoiceDuration(Date.now() - recordingStartedAt);
        const action = recordingStopAction;
        const chatUser = recordingChatUser;
        clearRecordingState();
        if (action === 'cancel' || !audioBlob.size) {
          showToast('تم إلغاء التسجيل');
          return;
        }
        if (action === 'preview') {
          voicePreview = {
            blob: audioBlob,
            url: URL.createObjectURL(audioBlob),
            duration,
            chatUser
          };
          voicePreviewAudio.src = voicePreview.url;
          setVoiceInputMode('preview');
          return;
        }
        sendAudioMessage(audioBlob, chatUser, duration);
      };
      mediaRecorder.start();
      isRecording = true;
      setVoiceInputMode('recording');
      voiceBtn.classList.add('recording');
      voiceBtn.title = 'جاري التسجيل';
      voiceRecordingHint.textContent = 'اسحب لليسار للإلغاء · لأعلى للقفل';
      recordingTimer = setInterval(updateVoiceRecordingTimer, 250);
      updateVoiceRecordingTimer();
    } catch (error) {
      clearRecordingState();
      showToast('لم يتم السماح باستخدام الميكروفون');
    }
  }

  function bindVoiceRecordingGestures() {
    if (!voiceBtn) return;
    voiceBtn.addEventListener('pointerdown', event => {
      if (event.button !== undefined && event.button !== 0) return;
      if (voicePreview) {
        clearVoicePreview();
        return;
      }
      event.preventDefault();
      recordingPointerId = event.pointerId;
      recordingPointerActive = true;
      recordingStartX = event.clientX;
      voiceBtn.setPointerCapture?.(event.pointerId);
      startVoiceRecording();
    });
    voiceBtn.addEventListener('pointermove', event => {
      if (!isRecording || recordingLocked || event.pointerId !== recordingPointerId) return;
      const deltaX = event.clientX - recordingStartX;
      const deltaY = event.clientY - (voiceBtn.getBoundingClientRect().top + voiceBtn.offsetHeight / 2);
      if (deltaX < -70) {
        recordingCancelled = true;
        voiceRecordingHint.textContent = 'اترك الزر لإلغاء التسجيل';
        voiceBtn.classList.add('canceling');
      } else if (deltaY < -70) {
        recordingLocked = true;
        voiceBtn.classList.add('locked');
        voiceRecordingLock.textContent = '🔒';
        voiceRecordingHint.textContent = 'تم القفل · أوقف التسجيل للمعاينة';
      } else {
        recordingCancelled = false;
        voiceBtn.classList.remove('canceling');
        voiceRecordingHint.textContent = 'اسحب لليسار للإلغاء · لأعلى للقفل';
      }
    });
    const release = event => {
      if (event.pointerId !== recordingPointerId) return;
      recordingPointerActive = false;
      if (!isRecording) return;
      if (recordingLocked) return;
      stopVoiceRecording(recordingCancelled ? 'cancel' : 'send');
    };
    voiceBtn.addEventListener('pointerup', release);
    voiceBtn.addEventListener('pointercancel', () => {
      recordingPointerActive = false;
      if (isRecording && !recordingLocked) stopVoiceRecording('cancel');
    });
  }

  window._toggleVoiceRecording = function() {
    if (isRecording) {
      stopVoiceRecording(recordingLocked ? 'preview' : 'send');
    } else if (currentChatUser) {
      recordingPointerActive = true;
      recordingStartX = voiceBtn.getBoundingClientRect().left;
      startVoiceRecording();
    }
  };

  window._cancelVoiceRecording = function() {
    if (isRecording) {
      recordingPointerActive = false;
      stopVoiceRecording('cancel');
    } else if (voicePreview) {
      clearVoicePreview();
    }
  };

  window._finishVoiceRecordingPreview = function() {
    if (isRecording) stopVoiceRecording('preview');
  };

  window._discardVoicePreview = function() {
    if (voicePreview) {
      clearVoicePreview();
      showToast('تم حذف التسجيل');
    }
  };

  window._sendVoicePreview = function() {
    if (!voicePreview) return;
    const preview = voicePreview;
    clearVoicePreview();
    sendAudioMessage(preview.blob, preview.chatUser, preview.duration);
  };

  bindVoiceRecordingGestures();

  function renderPrivateMessages() {
    privateMessagesList.innerHTML = '';

    const conversations = [...privateMessagesData].sort(
      (firstConversation, secondConversation) =>
        (Number(secondConversation.latestAt) || 0) - (Number(firstConversation.latestAt) || 0)
    );

    if (conversations.length === 0) {
      privateMessagesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="empty-title">لا توجد رسائل</div>
          <div class="empty-desc">ابدأ محادثة جديدة مع أحد المتصلين الآن</div>
        </div>
      `;
      return;
    }

    conversations.forEach((msg, i) => {
      const card = document.createElement('div');
      card.className = 'private-msg-card';
      card.style.animationDelay = (i * 0.06) + 's';
      const linkedUser = users.find(user => user.name === msg.name);
      const badgeHtml = getUserBadgeMarkup(linkedUser);
      const avatarUser = linkedUser || { gender: msg.gender || 'ذكر' };

      const unreadBadge = msg.unread > 0 
        ? `<span class="private-msg-unread">${msg.unread}</span>` 
        : '';

      card.innerHTML = `
        <div class="private-msg-avatar">${getAvatarMarkup(avatarUser)}</div>
        <div class="private-msg-info">
          <div class="private-msg-name"><span>${msg.name}</span>${badgeHtml}</div>
          <div class="private-msg-preview">${msg.preview}</div>
        </div>
        <div class="private-msg-meta">
          <span class="private-msg-time">${msg.time}</span>
          ${unreadBadge}
        </div>
      `;
      card.querySelector('.private-msg-avatar').addEventListener('click', (event) => {
        event.stopPropagation();
        const existingUser = users.find(user => user.name === msg.name);
        window._openUserProfile(existingUser || {
          id: msg.id,
          name: msg.name,
          initials: msg.initials,
          color: msg.color,
          bio: '',
          age: 0,
          gender: '',
          nationality: 'غير محددة',
          country: null,
          avatar: ''
        });
      });

      card.addEventListener('click', () => {
        let user = users.find(u => u.name === msg.name);
        if (!user) {
          user = {
            id: userIdCounter++,
            name: msg.name,
            initials: msg.initials,
            color: msg.color,
            bio: bios[Math.floor(Math.random() * bios.length)],
            age: Math.floor(Math.random() * 25) + 18,
            country: countries[Math.floor(Math.random() * countries.length)],
            badge: null,
            lastSeen: 'الآن',
            msgCount: 0,
            isNew: false
          };
          user.countryCode = user.country.code;
          user.nationality = user.country.name;
          users.push(user);
        }
        if (isCurrentUser(user)) {
          window._closePrivateMessages();
          window._openUserProfile(user);
        } else {
          msg.unread = 0;
          updateMessagesBadge();
          openChat(user);
        }
      });

      privateMessagesList.appendChild(card);
    });
  }

  function ensurePrivateConversation(user) {
    if (!user || isCurrentUser(user)) return null;
    let conversation = privateMessagesData.find(item => item.name === user.name);
    if (!conversation) {
      conversation = {
        id: user.id,
        name: user.name,
        initials: user.initials,
        color: user.color,
        preview: '',
        time: '',
        unread: 0,
        latestAt: Date.now()
      };
      privateMessagesData.push(conversation);
    }
    return conversation;
  }

  function syncPrivateMessageSummary(user, unreadDelta = 0) {
    const conversation = ensurePrivateConversation(user);
    const conversationMessages = user && messages[user.id];
    if (!conversation || !conversationMessages || conversationMessages.length === 0) return;

    const latestMessage = conversationMessages[conversationMessages.length - 1];
    conversation.preview = latestMessage.text || (
      latestMessage.type === 'audio' ? 'تسجيل صوتي' : 'مرفق'
    );
    conversation.time = latestMessage.time || getTime();
    conversation.latestAt = Date.now();
    conversation.unread = Math.max(0, (conversation.unread || 0) + unreadDelta);
    if (privateMessagesPage.style.display !== 'none') renderPrivateMessages();
    updateMessagesBadge();
  }

  function updateMessagesBadge() {
    const totalUnread = privateMessagesData.reduce((sum, m) => sum + m.unread, 0);
    if (totalUnread > 0) {
      messagesBadge.textContent = totalUnread;
      messagesBadge.style.display = 'flex';
    } else {
      messagesBadge.style.display = 'none';
    }
  }

  function enableLongPressHighlight(card) {
    let longPressTimer = null;

    const clearLongPress = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      card.classList.remove('long-pressed');
    };

    card.addEventListener('pointerdown', event => {
      if (event.button !== undefined && event.button !== 0) return;
      clearLongPress();
      longPressTimer = setTimeout(() => {
        card.classList.add('long-pressed');
        longPressTimer = null;
      }, 550);
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(eventName => {
      card.addEventListener(eventName, clearLongPress);
    });
  }

  window._renderUsers = function(filter) {
    filter = filter || '';
    const now = Date.now();
    const filtered = users.filter(u =>
      !blockedUsers.has(u.id) &&
      u.name.includes(filter) &&
      (!isFeaturedView || (u.connectedAt && now - u.connectedAt >= featuredAfterMs))
    );
    filtered.sort((firstUser, secondUser) => {
      const firstJoinedAt = Number(firstUser.joinedAt) || 0;
      const secondJoinedAt = Number(secondUser.joinedAt) || 0;
      return secondJoinedAt - firstJoinedAt;
    });
    if (filtered.length === 0) {
      usersList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <div class="empty-title">لا يوجد مستخدمين</div>
          <div class="empty-desc">جرب بحث مختلف أو انتظر حتى ينضم مستخدمون جدد للدردشة</div>
        </div>
      `;
       if (onlineCount) onlineCount.textContent = '0';
      return;
    }

    usersList.innerHTML = '';

    filtered.forEach((user, i) => {
      const isMine = isCurrentUser(user);
      const displayUser = isMine ? myProfile : user;
      const customBg = displayUser.cardBg || (isMine && myProfile.cardBg ? myProfile.cardBg : '');

      const card = document.createElement('div');
      card.className = 'user-card user-card-with-bg' + (user.isNew ? ' new-user' : '') + (isMine ? ' current-user' : '');
      if (customBg) {
        card.style.backgroundImage = `url('${customBg}')`;
      }
      card.dataset.userId = String(user.id);
      card.style.animationDelay = (i * 0.06) + 's';

       const badgeHtml = isFeaturedView
         ? '<span class="user-badge badge-vip">VIP</span>'
         : getUserBadgeMarkup(displayUser, now);
      const userActionMarkup = isMine ? '' : `
        <div class="user-action">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m22 2-7 20-4-9-9-4 20-7z"/>
          </svg>
        </div>
      `;

      const avatarClass = `user-avatar ${displayUser.avatar ? '' : displayUser.gender === 'أنثى' ? 'avatar-placeholder female' : 'avatar-placeholder male'}`;
      const avatarInner = getAvatarMarkup(displayUser);

      card.innerHTML = `
        <div class="user-avatar-wrap">
           <div class="${avatarClass}">${avatarInner}</div>
          <span class="user-status-dot"></span>
        </div>
        <div class="user-info">
          <div class="user-name-row">
            <span class="user-name">${displayUser.name}</span>
            ${badgeHtml}
          </div>
           <div class="user-meta">
            <span class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
               ${displayUser.age || '—'} سنة
            </span>
            <span class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                ${displayUser.country ? displayUser.country.flag : '🌍'} ${displayUser.country ? displayUser.country.name : 'غير محددة'}
            </span>
          </div>
        </div>
        ${userActionMarkup}
      `;
      card.querySelector('.user-avatar').addEventListener('click', (event) => {
        event.stopPropagation();
         window._openUserProfile(displayUser);
      });
      card.addEventListener('click', () => {
        if (isMine) {
          window._openUserProfile(user);
        } else {
           openChat(displayUser);
        }
      });
      enableLongPressHighlight(card);
      usersList.appendChild(card);
    });

     if (onlineCount) onlineCount.textContent = filtered.length;
  };

  window._openChat = function(user) {
    if (!user || isCurrentUser(user)) {
      showToast('لا يمكنك بدء محادثة مع نفسك');
      return;
    }
    pushAppView('chat');
    profilePage.style.display = 'none';
    privateMessagesPage.style.display = 'none';
    currentChatUser = user;
    chatUsername.textContent = user.name;
    chatUsernameBadge.innerHTML = getUserBadgeMarkup(user);
    chatAvatar.className = `chat-avatar ${user.avatar ? '' : `avatar-placeholder ${user.gender === 'أنثى' ? 'female' : 'male'}`}`;
    chatAvatar.style.background = '';
    chatAvatar.innerHTML = getAvatarMarkup(user);
    chatAvatar.onclick = event => {
      event.stopPropagation();
      if (currentChatUser) window._openUserProfile(currentChatUser);
    };
    chatAvatar.setAttribute('role', 'button');
    chatAvatar.setAttribute('tabindex', '0');
    chatAvatar.setAttribute('aria-label', `فتح ملف ${user.name}`);
    chatAvatar.onkeydown = event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (currentChatUser) window._openUserProfile(currentChatUser);
      }
    };
    chatStatusText.textContent = 'متصل الآن';
    chatStatus.classList.remove('typing');

    if (!messages[user.id]) {
      messages[user.id] = [
        { id: generateId(), from: 'them', text: 'مرحباً! أنا ' + user.name + ' سعيد بالتحدث معك!', time: getTime(), read: true }
      ];
      messages[user.id].forEach(message => messageAnimations.add(message.id));
    }
    const conversation = ensurePrivateConversation(user);
    if (conversation) {
      conversation.unread = 0;
      updateMessagesBadge();
    }
    renderMessages();

    chatView.style.display = 'flex';
    msgInput.focus();

  };

  window._closeChat = function() {
    goBackInApp();
    currentChatUser = null;
    isTyping = false;
    renderUsers(searchInput.value);
  };

  function refreshVipDisplays(forceRenderUsers = false) {
    if (forceRenderUsers) {
      window._renderUsers(searchInput.value);
    } else {
      usersList.querySelectorAll('.user-card[data-user-id]').forEach(card => {
        const user = users.find(item => String(item.id) === card.dataset.userId);
        const nameRow = card.querySelector('.user-name-row');
        if (!user || !nameRow) return;

        const badgeHtml = getUserBadgeMarkup(user);
        const currentBadge = nameRow.querySelector('.user-badge');
        if (currentBadge) currentBadge.remove();
        if (badgeHtml) nameRow.insertAdjacentHTML('beforeend', badgeHtml);
      });
    }
    if (currentChatUser) {
      chatUsernameBadge.innerHTML = getUserBadgeMarkup(currentChatUser);
    }
    if (profileTargetUser) {
      profileDisplayBadge.innerHTML = getUserBadgeMarkup(profileTargetUser);
    }
    if (privateMessagesPage.style.display !== 'none') {
      renderPrivateMessages();
    }
  }

  function renderMessages() {
    if (!currentChatUser) return;
    const msgs = messages[currentChatUser.id] || [];
    const dateDiv = document.createElement('div');
    dateDiv.className = 'messages-date';
    dateDiv.textContent = 'اليوم';
    const messageFragment = document.createDocumentFragment();
    messageFragment.appendChild(dateDiv);

    msgs.forEach((msg, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'msg-wrapper ' + (msg.from === 'me' ? 'sent' : 'received');
      if (messageAnimations.has(msg.id)) {
        wrapper.style.animationDelay = (i * 0.04) + 's';
      } else {
        wrapper.style.animation = 'none';
      }

      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble ' + (msg.from === 'me' ? 'sent' : 'received');

      const readIcon = msg.from === 'me' && msg.read
        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` 
        : '';

      const messageContent = msg.mediaUrl
        ? (msg.mediaType && msg.mediaType.startsWith('video/')
          ? `<div class="media-message"><video controls playsinline src="${msg.mediaUrl}"></video><span>${msg.text}</span></div>`
          : `<div class="media-message"><img src="${msg.mediaUrl}" alt="${msg.text}"><span>${msg.text}</span></div>`)
        : msg.audioUrl
        ? `<div class="audio-message"><span>🎙️ ${msg.text}</span><audio controls src="${msg.audioUrl}"></audio></div>`
        : (msg.text || '').replace(/\n/g, '<br>');

      bubble.innerHTML = messageContent + `
        <div class="msg-time">
          ${msg.time}
          ${msg.from === 'me' ? '<span class="msg-read">' + readIcon + '</span>' : ''}
        </div>
      `;
      const messageOwner = msg.from === 'me' ? myProfile : currentChatUser;
      const avatar = document.createElement('div');
      avatar.className = 'msg-avatar';
      avatar.setAttribute('aria-label', messageOwner && messageOwner.name
        ? `صورة ${messageOwner.name}`
        : 'صورة المستخدم');
      avatar.innerHTML = getAvatarMarkup(messageOwner || {});
      wrapper.appendChild(bubble);
      wrapper.appendChild(avatar);
      messageFragment.appendChild(wrapper);
    });

    messagesArea.replaceChildren(messageFragment);
    messageAnimations.clear();
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function showTyping() {
    if (isTyping) return;
    isTyping = true;
    chatStatusText.textContent = 'يكتب الآن...';
    chatStatus.classList.add('typing');

    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    messagesArea.appendChild(typingDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function hideTyping() {
    isTyping = false;
    chatStatusText.textContent = 'متصل الآن';
    chatStatus.classList.remove('typing');
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  window._sendMessage = function() {
    const text = msgInput.value.trim();
    if (!text || !currentChatUser) return;

    if (containsCode(text)) {
      showToast('عذراً، غير مسموح بإرسال الأكواد البرمجية');
      return;
    }

    const chatUser = currentChatUser;
    const msgId = generateId();
    messages[chatUser.id].push({
      id: msgId, from: 'me', text: text, time: getTime(), read: false
    });
    messages[chatUser.id] = messages[chatUser.id].slice(-70);
    syncPrivateMessageSummary(chatUser);
    messageAnimations.add(msgId);
    chatUser.msgCount++;
    totalChats++;
     if (statChats) statChats.textContent = totalChats;
    msgInput.value = '';
    renderMessages();

    setTimeout(() => {
      const msg = messages[chatUser.id].find(m => m.id === msgId);
      if (msg) {
        msg.read = true;
        if (currentChatUser && currentChatUser.id === chatUser.id) renderMessages();
      }
    }, 900);

    const reply = replies[Math.floor(Math.random() * replies.length)];
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        hideTyping();
        const replyId = generateId();
        messages[chatUser.id].push({
          id: replyId,
          from: 'them',
          text: reply.text,
          time: getTime(),
          read: Boolean(currentChatUser && currentChatUser.id === chatUser.id)
        });
        messages[chatUser.id] = messages[chatUser.id].slice(-70);
        messageAnimations.add(replyId);
        chatUser.msgCount++;
        totalChats++;
        if (statChats) statChats.textContent = totalChats;
        syncPrivateMessageSummary(
          chatUser,
          currentChatUser && currentChatUser.id === chatUser.id ? 0 : 1
        );
        if (currentChatUser && currentChatUser.id === chatUser.id) renderMessages();
      }, 1800);
    }, reply.delay);
  };

  setInterval(() => {
    const action = Math.random();

    if (action < 0.28 && users.length < 16) {
      const firstName = extraNames[Math.floor(Math.random() * extraNames.length)];
      const lastName = extraNames[Math.floor(Math.random() * extraNames.length)];
      const name = firstName + ' ' + lastName;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const newUser = {
        id: userIdCounter++,
        name: name,
        initials: name.split(' ').map(n => n[0]).join(''),
        color: color,
        bio: bios[Math.floor(Math.random() * bios.length)],
        gender: Math.random() > 0.5 ? 'ذكر' : 'أنثى',
        badge: Math.random() > 0.65 ? 'new' : null,
        lastSeen: 'الآن',
        msgCount: 0,
        isNew: true,
        age: Math.floor(Math.random() * 25) + 18,
        country: countries[Math.floor(Math.random() * countries.length)],
        connectedAt: Date.now(),
        lastActivityAt: Date.now(),
        joinedAt: Date.now()
      };
      newUser.countryCode = newUser.country.code;
      newUser.nationality = newUser.country.name;
      users.unshift(newUser);

      const filter = searchInput.value;
      if (!isFeaturedView && (!filter || newUser.name.includes(filter))) {
        const previousPositions = new Map(
          [...usersList.querySelectorAll('.user-card')].map(card => [card, card.getBoundingClientRect()])
        );
        const card = document.createElement('div');
        card.className = 'user-card';
        card.dataset.userId = String(newUser.id);
        card.style.animation = 'none';

        const badgeHtml = getUserBadgeMarkup(newUser);

        const newAvatarClass = `user-avatar ${newUser.avatar ? '' : newUser.gender === 'أنثى' ? 'avatar-placeholder female' : 'avatar-placeholder male'}`;
        const newAvatarInner = getAvatarMarkup(newUser);

        card.innerHTML = `
          <div class="user-avatar-wrap">
            <div class="${newAvatarClass}">${newAvatarInner}</div>
            <span class="user-status-dot"></span>
          </div>
          <div class="user-info">
            <div class="user-name-row">
              <span class="user-name">${newUser.name}</span>
              ${badgeHtml}
            </div>
             <div class="user-meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                 ${newUser.age || '—'} سنة
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                 ${newUser.country ? newUser.country.flag : '🌍'} ${newUser.country ? newUser.country.name : 'غير محددة'}
              </span>
            </div>
          </div>
          <div class="user-action">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 2-7 20-4-9-9-4 20-7z"/>
            </svg>
          </div>
        `;
        card.querySelector('.user-avatar').addEventListener('click', (event) => {
          event.stopPropagation();
          window._openUserProfile(newUser);
        });
        card.addEventListener('click', () => openChat(newUser));
        enableLongPressHighlight(card);

        usersList.insertBefore(card, usersList.firstChild);

        requestAnimationFrame(() => {
          usersList.querySelectorAll('.user-card').forEach(existingCard => {
            if (existingCard === card) return;
            const previousPosition = previousPositions.get(existingCard);
            if (!previousPosition) return;

            const currentPosition = existingCard.getBoundingClientRect();
            const deltaX = previousPosition.left - currentPosition.left;
            const deltaY = previousPosition.top - currentPosition.top;
            if (deltaX === 0 && deltaY === 0) return;

            existingCard.animate(
              [
                { transform: `translate(${deltaX}px, ${deltaY}px)` },
                { transform: 'translate(0, 0)' }
              ],
              {
                duration: 420,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
              }
            );
          });
        });

          if (onlineCount) onlineCount.textContent = users.filter(u =>
            u.name.includes(filter) && (!isFeaturedView || Date.now() - u.connectedAt >= featuredAfterMs)
          ).length;
      }

       setTimeout(() => { newUser.isNew = false; }, 1000);

    }

      removeExpiredOfflineUsers();

      const vipStateChanged = users.some(user => {
        const isFeatured = isFeaturedUser(user);
       if (user._featuredState === undefined) {
         user._featuredState = isFeatured;
         return false;
       }
       if (user._featuredState !== isFeatured) {
         user._featuredState = isFeatured;
         return true;
       }
       return false;
     });
       if (vipStateChanged) refreshVipDisplays(isFeaturedView);
  }, 5000);

  configureDrawerMenu();
  restoreMyProfile();
  restorePublicMessages();
  renderDrawerProfile();
  myProfile.connectedAt = initialSessionStartedAt - (65 * 60 * 1000);
  myProfile.lastActivityAt = initialSessionStartedAt;
  let isFirstPresenceEntry = true;
  let storedJoinedAt = null;
  try {
    isFirstPresenceEntry = sessionStorage.getItem(presenceSessionKey) !== 'joined';
    storedJoinedAt = Number(sessionStorage.getItem(presenceJoinedAtKey)) || null;
    sessionStorage.setItem(presenceSessionKey, 'joined');
  } catch (error) {
    isFirstPresenceEntry = true;
  }
   const savedMyProfileJoinedAt = Number(storedDirectoryOrder[String(myProfile.id)]) || storedJoinedAt || 0;
   if (!savedMyProfileJoinedAt && isFirstPresenceEntry) {
     myProfile.joinedAt = Date.now();
    try {
      sessionStorage.setItem(presenceJoinedAtKey, String(myProfile.joinedAt));
      storedDirectoryOrder[String(myProfile.id)] = myProfile.joinedAt;
      localStorage.setItem(directoryOrderStorageKey, JSON.stringify(storedDirectoryOrder));
    } catch (error) {
      // Keep the in-memory join time if session storage is unavailable.
    }
    users.unshift(myProfile);
  } else {
     myProfile.joinedAt = savedMyProfileJoinedAt || initialSessionStartedAt;
    users.push(myProfile);
  }
  restoreMyBlockedUsers();
  renderUsers();
  renderPublicRoomPreview();
  updateMessagesBadge();

})();

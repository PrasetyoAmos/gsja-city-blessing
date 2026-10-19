$('#contact-form').addEventListener('submit',e=>{e.preventDefault();
  const nama=$('#c-nama').value.trim(),pesan=$('#c-pesan').value.trim(),st=$('#c-status');
  if(!nama||!pesan){st.style.color='var(--error)';st.textContent='Mohon isi nama dan pesan terlebih dahulu.';return}
  const text=`Shalom, saya ${nama}.\nKategori: ${$('#c-kat').value}\n${$('#c-wa').value?'WhatsApp: '+$('#c-wa').value+'\n':''}${$('#c-email').value?'Email: '+$('#c-email').value+'\n':''}\n${pesan}`;
  st.style.color='';st.textContent='Membuka WhatsApp sekretariat…';
  const l=document.createElement('a');l.href='https://wa.me/6281288175905?text='+encodeURIComponent(text);l.target='_blank';l.rel='noopener';document.body.appendChild(l);l.click();l.remove();
});

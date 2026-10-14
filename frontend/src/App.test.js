import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LangContext, textoApadrinamiento, translations } from './i18n';
import RegisterFamily from './pages/RegisterFamily';
import PadrinoForm from './PadrinoForm';

jest.mock('./AuthContext', () => ({
  useAuth: () => ({ user: { email: 'ana@example.com', displayName: 'Ana', uid: '1' } }),
}));

function wrap(ui, lang = 'es') {
  return render(
    <MemoryRouter>
      <LangContext.Provider value={{ lang, setLang: () => {}, t: translations[lang] }}>
        {ui}
      </LangContext.Provider>
    </MemoryRouter>
  );
}

test('el registro no promete un WhatsApp público y pide evitar el rostro', () => {
  wrap(<RegisterFamily />);
  expect(screen.getByText('Foto de la familia (opcional, nunca se publica)')).toBeInTheDocument();
  expect(screen.getByText(/Evita el rostro del niño/)).toBeInTheDocument();
  expect(screen.getByText(/No aparece en la carta/)).toBeInTheDocument();
  expect(screen.queryByText(/botón de WhatsApp/i)).not.toBeInTheDocument();
});

test('la ficha deja elegir padrino o madrina', () => {
  wrap(<PadrinoForm ninoId="1" ninoNombre="Lucía" />);
  expect(screen.getByRole('button', { name: /^Padrino$/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Madrina$/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /quiero ser su padrino/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^Madrina$/ }));
  expect(screen.getByRole('button', { name: /quiero ser su madrina/i })).toBeInTheDocument();
});

test('en inglés la ficha dice godfather y godmother', () => {
  wrap(<PadrinoForm ninoId="1" ninoNombre="Lucía" />, 'en');
  expect(screen.getByRole('button', { name: /^Godfather$/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Godmother$/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^Godmother$/ }));
  expect(screen.getByRole('button', { name: /their godmother/i })).toBeInTheDocument();
});

test('el texto público distingue su padrino y su madrina', () => {
  expect(textoApadrinamiento(translations.es, true, 'padrino')).toBe('Su padrino');
  expect(textoApadrinamiento(translations.es, true, 'madrina')).toBe('Su madrina');
  expect(textoApadrinamiento(translations.en, true, 'padrino')).toBe('Their godfather');
  expect(textoApadrinamiento(translations.en, true, 'madrina')).toBe('Their godmother');
  expect(textoApadrinamiento(translations.en, false, null)).toBe('Looking for a godparent');
});

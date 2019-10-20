import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

import Mail from '../../lib/Mail';

class AppointmentController {
  async index(req, res) {
    // controlar a numeração das páginas para limitar o numero na listagem
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { provider_id, date } = req.body;

    /**
     * check if provider_id is a provider
     */
    const isProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true,
      },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'Appointments only with providers!' });
    }
    // check if the user is not appointing with himself
    if (provider_id === req.userId) {
      return res.status(401).json({ error: 'Cannot appoint with urself' });
    }
    /**
     * check past date
     */
    // pegar apenas o inicio da hora
    const hourStart = startOfHour(parseISO(date));
    // verificar se a data é anterior a atual
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past date not permited' });
    }

    /**
     * check date availability
     */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });
    if (checkAvailability) {
      return res.status(400).json({ error: 'Appointment data not available' });
    }

    const appointment = await Appointment.create({
      provider_id,
      // isso faz com que os agendamentos sejam de hora em hora
      date: hourStart,
      user_id: req.userId,
    });

    /**
     * Notify appointment provider
     */
    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      // conteúdos dentro de aspas simples não serão modificados pelo format
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );
    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({ error: 'You are not allowed to do that' });
    }

    // removendo duas horas do horário marcado
    const dateWithSub = subHours(appointment.date, 2);
    // garantindo que o cancelamento seja feito com no mínimo 2 horas
    if (isBefore(dateWithSub, new Date())) {
      return res
        .status(401)
        .json({ error: 'Cancels are only allowed 2 hours before.' });
    }
    // colocando o cancelamento com a data atual
    appointment.canceled_at = new Date();

    await appointment.save();

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento Cancelado',
      // text: 'Você tem um novo cancelamento',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(appointment.date, "'dia' dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });
    return res.json(appointment);
  }
}

export default new AppointmentController();

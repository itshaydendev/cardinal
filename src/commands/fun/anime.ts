import { Message, MessageEmbed, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import TurndownService from 'turndown';
import Command from '../../core/Command';
import { formats, statuses, sources } from '../../anilist';
import { truncateString, parseFuzzyDate, isFuzzyDate } from '../../core/Util';

export default class AnimeCommand extends Command {
  public name = 'anime';

  public description = 'Retrieves information from AniList about an anime.';

  public usage = '<name>';

  public run = async (message: Message, ...args: string[]): Promise<void> => {
    const name = args.join(' ');

    const query = `
      query ($name: String) {
        Media (search: $name, type: ANIME) {
          id
          title {
            english
            romaji
            native
          }
          format
          status
          description (asHtml: false)
          startDate { year month day }
          endDate { year month day }
          episodes
          studios (isMain: true) { nodes { name } }
          source
          bannerImage
          coverImage { medium color }
          genres
          meanScore
          tags { name }
          isAdult
          siteUrl
        }
      }
    `;
    const variables = {
      name,
    };

    const url = 'https://graphql.anilist.co';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    };

    const res = await fetch(url, options);
    const {
      data: { Media: media },
    } = await res.json();

    if (media == null) {
      throw 'No such anime found!';
    }

    const channel = (await message.channel.fetch()) as TextChannel;
    if (!channel.nsfw && media.isAdult) {
      throw 'This anime is flagged as NSFW. To view it, please re-run this command in an NSFW channel.';
    }

    const turndown = new TurndownService();
    const description = truncateString(
      turndown.turndown(media.description),
      300,
    );

    const embed = new MessageEmbed({
      title: media.title.english
        ? media.title.english
        : media.title.romaji
        ? media.title.romaji
        : media.title.native,
      url: media.siteUrl,
      description,
      fields: [
        {
          name: 'Format',
          value: formats[media.format],
          inline: true,
        },
        {
          name: 'Status',
          value: statuses[media.status],
          inline: true,
        },
        {
          name: 'Episodes',
          value: media.episodes ?? 'N/a',
          inline: true,
        },
        {
          name: 'Source',
          value: sources[media.source],
          inline: true,
        },
        {
          name: 'Score',
          value: media.meanScore,
          inline: true,
        },
        {
          name: 'Main Studio',
          value: media.studios.nodes[0].name,
          inline: true,
        },
        {
          name: 'Start Date (Y/M/D)',
          value: isFuzzyDate(media.StartDate)
            ? parseFuzzyDate(media.startDate)
            : 'N/a',
          inline: true,
        },
        {
          name: 'End Date (Y/M/D)',
          value: isFuzzyDate(media.StartDate)
            ? parseFuzzyDate(media.endDate)
            : 'N/a',
          inline: true,
        },
        {
          name: 'Tags',
          value: media.tags.map((v: { name: string }) => v.name).join(', '),
        },
        {
          name: 'Genres',
          value: media.genres.join(', '),
        },
      ],
      footer: {
        text: 'Information provided by Anilist (anilist.co).',
        icon_url: 'https://avatars2.githubusercontent.com/u/18018524?s=128&v=4',
      },
      color: media.coverImage.color,
    });
    embed.setThumbnail(media.coverImage.medium);
    embed.setImage(media.bannerImage);

    message.channel.send(embed);
  };
}

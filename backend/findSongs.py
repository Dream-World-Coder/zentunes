"""
Copyright-Free Music Finder
Searches multiple sites for copyright-free music and saves results to output.txt
"""

import requests
from bs4 import BeautifulSoup
import re
import time
import urllib.parse
from datetime import datetime
import json
import random

class MusicFinder:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.results = []

        # Site configurations
        self.sites = {
            'Free Music Archive': {
                'url': 'https://freemusicarchive.org/search',
                'search_param': 'q',
                'method': self._search_fma
            },
            'IMSLP.org': {
                'url': 'https://imslp.org/wiki/Special:RecentChanges',
                'search_param': 'search',
                'method': self._search_imslp
            },
            'Musopen.org': {
                'url': 'https://musopen.org/music',
                'search_param': 'search',
                'method': self._search_musopen
            },
            'YouTube Audio Library': {
                'url': 'https://www.youtube.com/audiolibrary/music',
                'search_param': 'q',
                'method': self._search_youtube_audio
            },
            'ccMixter': {
                'url': 'http://ccmixter.org/search',
                'search_param': 'searchp',
                'method': self._search_ccmixter
            },
            'Jamendo': {
                'url': 'https://www.jamendo.com/search',
                'search_param': 'q',
                'method': self._search_jamendo
            },
            'Bensound': {
                'url': 'https://www.bensound.com',
                'search_param': 'q',
                'method': self._search_bensound
            },
            'Incompetech': {
                'url': 'https://incompetech.com/music/royalty-free/music.html',
                'search_param': 'q',
                'method': self._search_incompetech
            },
            'Internet Archive': {
                'url': 'https://archive.org/search.php',
                'search_param': 'query',
                'method': self._search_archive
            }
        }

    def clean_song_name(self, song_name):
        """Clean and prepare song name for search"""
        # Remove common prefixes/suffixes and normalize
        cleaned = re.sub(r'\b(op\.?|opus|no\.?|number)\s*\d+', '', song_name, flags=re.IGNORECASE)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned

    def create_search_variants(self, song_name):
        """Create different search variants for better matching"""
        variants = [song_name]
        cleaned = self.clean_song_name(song_name)
        if cleaned != song_name:
            variants.append(cleaned)

        # Split by common separators
        for sep in ['-', ':', ',', '(', ')']:
            if sep in song_name:
                parts = song_name.split(sep)
                variants.extend([part.strip() for part in parts if len(part.strip()) > 3])

        return list(set(variants))

    def _search_fma(self, song_name):
        """Search Free Music Archive"""
        try:
            search_url = f"https://freemusicarchive.org/search?q={urllib.parse.quote(song_name)}"
            response = self.session.get(search_url, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                results = []

                # Look for track results
                tracks = soup.find_all('div', class_='track-item') or soup.find_all('a', href=re.compile(r'/music/'))

                for track in tracks[:5]:  # Limit to top 5 results
                    title_elem = track.find('h3') or track.find('span', class_='track-title') or track
                    if title_elem:
                        title = title_elem.get_text(strip=True)
                        link = track.get('href') or track.find('a')
                        if link and hasattr(link, 'get'):
                            link = link.get('href')

                        if self._fuzzy_match(song_name, title):
                            results.append({
                                'title': title,
                                'url': f"https://freemusicarchive.org{link}" if link and not link.startswith('http') else link,
                                'match_score': self._calculate_match_score(song_name, title)
                            })

                return results[:3]  # Return top 3 matches
        except Exception as e:
            print(f"Error searching FMA: {e}")
        return []

    def _search_imslp(self, song_name):
        """Search IMSLP (International Music Score Library Project)"""
        try:
            # IMSLP has a specific search format
            search_query = urllib.parse.quote(song_name)
            search_url = f"https://imslp.org/wiki/Special:Search?search={search_query}"

            response = self.session.get(search_url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                results = []

                # Look for search results
                search_results = soup.find_all('div', class_='mw-search-result-heading') or soup.find_all('a', title=True)

                for result in search_results[:5]:
                    title_elem = result.find('a') if not result.name == 'a' else result
                    if title_elem:
                        title = title_elem.get('title') or title_elem.get_text(strip=True)
                        link = title_elem.get('href')

                        if self._fuzzy_match(song_name, title):
                            results.append({
                                'title': title,
                                'url': f"https://imslp.org{link}" if link and not link.startswith('http') else link,
                                'match_score': self._calculate_match_score(song_name, title)
                            })

                return results[:3]
        except Exception as e:
            print(f"Error searching IMSLP: {e}")
        return []

    def _search_musopen(self, song_name):
        """Search Musopen"""
        try:
            search_url = f"https://musopen.org/music/?search={urllib.parse.quote(song_name)}"
            response = self.session.get(search_url, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                results = []

                # Look for music items
                music_items = soup.find_all('div', class_='music-item') or soup.find_all('a', href=re.compile(r'/music/'))

                for item in music_items[:5]:
                    title_elem = item.find('h3') or item.find('h4') or item
                    if title_elem:
                        title = title_elem.get_text(strip=True)
                        link = item.get('href') or item.find('a')
                        if link and hasattr(link, 'get'):
                            link = link.get('href')

                        if self._fuzzy_match(song_name, title):
                            results.append({
                                'title': title,
                                'url': f"https://musopen.org{link}" if link and not link.startswith('http') else link,
                                'match_score': self._calculate_match_score(song_name, title)
                            })

                return results[:3]
        except Exception as e:
            print(f"Error searching Musopen: {e}")
        return []

    def _search_youtube_audio(self, song_name):
        """Search YouTube Audio Library (limited due to authentication requirements)"""
        try:
            # Note: YouTube Audio Library requires authentication, so this is a placeholder
            # In practice, you'd need to use the YouTube API
            print(f"YouTube Audio Library search requires API key - skipping direct search for '{song_name}'")
            return [{
                'title': f"Search manually: {song_name}",
                'url': "https://www.youtube.com/audiolibrary/music",
                'match_score': 0.5,
                'note': 'Manual search required - YouTube Audio Library needs authentication'
            }]
        except Exception as e:
            print(f"Error with YouTube Audio Library: {e}")
        return []

    def _search_ccmixter(self, song_name):
        """Search ccMixter"""
        try:
            search_url = f"http://ccmixter.org/search?searchp={urllib.parse.quote(song_name)}"
            response = self.session.get(search_url, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                results = []

                # Look for upload items
                uploads = soup.find_all('div', class_='upload_item') or soup.find_all('a', class_='cc_file_link')

                for upload in uploads[:5]:
                    title_elem = upload.find('a', class_='cc_file_link') or upload.find('span', class_='cc_file_name')
                    if title_elem:
                        title = title_elem.get_text(strip=True)
                        link = title_elem.get('href') if title_elem.name == 'a' else upload.find('a')
                        if link and hasattr(link, 'get'):
                            link = link.get('href')

                        if self._fuzzy_match(song_name, title):
                            results.append({
                                'title': title,
                                'url': f"http://ccmixter.org{link}" if link and not link.startswith('http') else link,
                                'match_score': self._calculate_match_score(song_name, title)
                            })

                return results[:3]
        except Exception as e:
            print(f"Error searching ccMixter: {e}")
        return []

    def _search_jamendo(self, song_name):
        """Search Jamendo"""
        try:
            search_url = f"https://www.jamendo.com/search/tracks?q={urllib.parse.quote(song_name)}"
            response = self.session.get(search_url, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                results = []

                # Look for track items
                tracks = soup.find_all('div', class_='track-item') or soup.find_all('a', href=re.compile(r'/track/'))

                for track in tracks[:5]:
                    title_elem = track.find('span', class_='track-name') or track.find('h3')
                    if title_elem:
                        title = title_elem.get_text(strip=True)
                        link = track.get('href') or track.find('a')
                        if link and hasattr(link, 'get'):
                            link = link.get('href')

                        if self._fuzzy_match(song_name, title):
                            results.append({
                                'title': title,
                                'url': f"https://www.jamendo.com{link}" if link and not link.startswith('http') else link,
                                'match_score': self._calculate_match_score(song_name, title)
                            })

                return results[:3]
        except Exception as e:
            print(f"Error searching Jamendo: {e}")
        return []

    def _search_bensound(self, song_name):
        """Search Bensound"""
        try:
            # Bensound doesn't have a direct search API, so we'll check their main page
            response = self.session.get("https://www.bensound.com/royalty-free-music", timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                results = []

                # Look for music tracks
                tracks = soup.find_all('div', class_='track') or soup.find_all('a', href=re.compile(r'\.mp3'))

                for track in tracks[:10]:  # Check more since we're doing fuzzy matching
                    title_elem = track.find('span') or track.find('div') or track
                    if title_elem:
                        title = title_elem.get_text(strip=True)
                        link = track.get('href') or track.find('a')
                        if link and hasattr(link, 'get'):
                            link = link.get('href')

                        if self._fuzzy_match(song_name, title):
                            results.append({
                                'title': title,
                                'url': f"https://www.bensound.com{link}" if link and not link.startswith('http') else link,
                                'match_score': self._calculate_match_score(song_name, title)
                            })

                return results[:3]
        except Exception as e:
            print(f"Error searching Bensound: {e}")
        return []

    def _search_incompetech(self, song_name):
        """Search Incompetech"""
        try:
            search_url = f"https://incompetech.com/music/royalty-free/music.html?q={urllib.parse.quote(song_name)}"
            response = self.session.get(search_url, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                results = []

                # Look for music tracks
                tracks = soup.find_all('div', class_='music-item') or soup.find_all('a', href=re.compile(r'\.mp3'))

                for track in tracks[:5]:
                    title_elem = track.find('strong') or track.find('b') or track
                    if title_elem:
                        title = title_elem.get_text(strip=True)
                        link = track.get('href') or track.find('a')
                        if link and hasattr(link, 'get'):
                            link = link.get('href')

                        if self._fuzzy_match(song_name, title):
                            results.append({
                                'title': title,
                                'url': f"https://incompetech.com{link}" if link and not link.startswith('http') else link,
                                'match_score': self._calculate_match_score(song_name, title)
                            })

                return results[:3]
        except Exception as e:
            print(f"Error searching Incompetech: {e}")
        return []

    def _search_archive(self, song_name):
        """Search Internet Archive"""
        try:
            search_url = f"https://archive.org/search.php?query={urllib.parse.quote(song_name)}&and[]=mediatype%3A%22audio%22"
            response = self.session.get(search_url, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                results = []

                # Look for search results
                items = soup.find_all('div', class_='item-ia') or soup.find_all('a', href=re.compile(r'/details/'))

                for item in items[:5]:
                    title_elem = item.find('div', class_='ttl') or item.find('h3') or item
                    if title_elem:
                        title = title_elem.get_text(strip=True)
                        link = item.get('href') or item.find('a')
                        if link and hasattr(link, 'get'):
                            link = link.get('href')

                        if self._fuzzy_match(song_name, title):
                            results.append({
                                'title': title,
                                'url': f"https://archive.org{link}" if link and not link.startswith('http') else link,
                                'match_score': self._calculate_match_score(song_name, title)
                            })

                return results[:3]
        except Exception as e:
            print(f"Error searching Internet Archive: {e}")
        return []

    def _fuzzy_match(self, search_term, title):
        """Check if title matches search term using fuzzy logic"""
        search_words = re.findall(r'\w+', search_term.lower())
        title_words = re.findall(r'\w+', title.lower())

        # Check for exact matches
        if search_term.lower() in title.lower():
            return True

        # Check if most significant words match
        matches = sum(1 for word in search_words if any(word in title_word for title_word in title_words))
        return matches >= len(search_words) * 0.6  # 60% word match threshold

    def _calculate_match_score(self, search_term, title):
        """Calculate match score between search term and title"""
        search_words = set(re.findall(r'\w+', search_term.lower()))
        title_words = set(re.findall(r'\w+', title.lower()))

        if not search_words:
            return 0

        intersection = search_words.intersection(title_words)
        return len(intersection) / len(search_words)

    def search_song(self, song_name):
        """Search for a song across all sites"""
        print(f"\n🎵 Searching for: {song_name}")
        song_results = {'song': song_name, 'results': {}}

        search_variants = self.create_search_variants(song_name)

        for site_name, site_config in self.sites.items():
            print(f"  🔍 Searching {site_name}...")
            site_results = []

            try:
                # Try each search variant
                for variant in search_variants:
                    try:
                        results = site_config['method'](variant)
                        site_results.extend(results)
                        if results:  # If we found something, no need to try other variants
                            break
                    except Exception as e:
                        print(f"    ⚠️  Error with variant '{variant}': {e}")
                        continue

                # Sort by match score and remove duplicates
                if site_results:
                    site_results = sorted(site_results, key=lambda x: x.get('match_score', 0), reverse=True)
                    # Remove duplicates based on title
                    seen_titles = set()
                    unique_results = []
                    for result in site_results:
                        if result['title'] not in seen_titles:
                            seen_titles.add(result['title'])
                            unique_results.append(result)
                    site_results = unique_results[:3]  # Top 3 unique results

                song_results['results'][site_name] = site_results

                if site_results:
                    print(f"    ✅ Found {len(site_results)} result(s)")
                else:
                    print(f"    ❌ No matches found")

            except Exception as e:
                print(f"    ❌ Failed to search {site_name}: {e}")
                song_results['results'][site_name] = []

            # Add delay to be respectful to servers
            time.sleep(random.uniform(1, 2))

        return song_results

    def search_all_songs(self, song_list):
        """Search for all songs in the list"""
        print(f"🎼 Starting search for {len(song_list)} songs...")
        print("=" * 60)

        all_results = []

        for i, song in enumerate(song_list, 1):
            print(f"\n[{i}/{len(song_list)}]")
            try:
                result = self.search_song(song)
                all_results.append(result)
            except Exception as e:
                print(f"❌ Failed to search for '{song}': {e}")
                all_results.append({'song': song, 'results': {}, 'error': str(e)})

        return all_results

    def save_results(self, results, filename='output.txt'):
        """Save results to a text file"""
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("COPYRIGHT-FREE MUSIC SEARCH RESULTS\n")
            f.write("=" * 50 + "\n")
            f.write(f"Search completed on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Total songs searched: {len(results)}\n\n")

            for result in results:
                f.write(f"🎵 SONG: {result['song']}\n")
                f.write("-" * 40 + "\n")

                if 'error' in result:
                    f.write(f"❌ ERROR: {result['error']}\n\n")
                    continue

                total_found = sum(len(site_results) for site_results in result['results'].values())
                f.write(f"Total results found: {total_found}\n\n")

                for site_name, site_results in result['results'].items():
                    f.write(f"📍 {site_name}:\n")

                    if site_results:
                        for i, item in enumerate(site_results, 1):
                            f.write(f"  {i}. {item['title']}\n")
                            f.write(f"     URL: {item.get('url', 'N/A')}\n")
                            f.write(f"     Match Score: {item.get('match_score', 0):.2f}\n")
                            if 'note' in item:
                                f.write(f"     Note: {item['note']}\n")
                            f.write("\n")
                    else:
                        f.write("  No results found\n\n")

                f.write("\n" + "=" * 50 + "\n\n")

def main():
    # Example usage
    song_list = [
        'Beethoven Symphony No 5 Op 67',
        'Bach Cello Suite No 1',
        'Mozart Eine kleine Nachtmusik',
        'Vivaldi Four Seasons Spring'
    ]

    finder = MusicFinder()
    results = finder.search_all_songs(song_list)
    finder.save_results(results)

    print("\n✅ Search complete! Results saved to 'output.txt'")
    print("📊 Summary:")
    for result in results:
        total = sum(len(site_results) for site_results in result.get('results', {}).values())
        print(f"  - {result['song']}: {total} results found")

if __name__ == "__main__":
    # You can modify this list with your songs
    SONGS_TO_SEARCH = [
        'Beethoven Symphony No 5 Op 67',
        'Fur Elise Beethoven',
        'Moonlight Sonata',
        'Alla Turka',
        'Turkish March',
        'Lacrimosa',
        'Paganini 24 Caprices'
    ]

    print("🎼 Copyright-Free Music Finder")
    print("==============================")

    finder = MusicFinder()
    results = finder.search_all_songs(SONGS_TO_SEARCH)
    finder.save_results(results)

    print("\n🎉 All done! Check 'output.txt' for detailed results.")

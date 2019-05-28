import asyncio
import asyncio
import requests
from concurrent.futures import ThreadPoolExecutor
from timeit import default_timer
import base64
import six

START_TIME = default_timer()

def get_client_access_token(client_id, client_secret):
    payload = { 'grant_type': 'client_credentials'}

    auth_header_content = base64.b64encode(six.text_type(client_id + ':' + client_secret).encode('ascii'))
    auth_header = {'Authorization': 'Basic {}'.format(auth_header_content.decode('ascii'))}

    response = requests.post("https://accounts.spotify.com/api/token", data=payload, headers=auth_header)
    
    if response.status_code != 200:
        raise Exception(response.reason)
        
    return response.json()['access_token']

def get(session, base_url, query, headers, verbose):
    url = base_url + query
    with session.get(url, headers=headers) as response:
        data = response.json()
        if response.status_code != 200:
            raise Exception(response.reason)
            
        if verbose:
            elapsed = default_timer() - START_TIME
            time_completed_at = "{:5.2f}s".format(elapsed)
            print("{0:<30} {1:>20}".format(url, time_completed_at))
        
        return data

async def async_getter(url, queries, headers=None, verbose=False):  
    if verbose:
        print("{0:<30} {1:>20}".format("File", "Completed at"))

    # Note: max_workers is set to 10 simply for this example,
    # you'll have to tweak with this number for your own projects
    # as you see fit
    with ThreadPoolExecutor(max_workers=10) as executor:
        with requests.Session() as session:
            # Set any session parameters here before calling `fetch`

            # Initialize the event loop        
            loop = asyncio.get_event_loop()
                            
            # Set the START_TIME for the `fetch` function
            START_TIME = default_timer()

            # Use list comprehension to create a list of
            # tasks to complete. The executor will run the `fetch`
            # function for each csv in the csvs_to_fetch list
            tasks = [
                loop.run_in_executor(
                    executor,
                    get,
                    *(session, url, query, headers, verbose) # Allows us to pass in multiple arguments to `fetch`
                )
                for query in queries
            ]
            
            # Initializes the tasks to run and awaits their results
            responses = []
            for response in await asyncio.gather(*tasks):
                responses.append(response)
            return responses

def async_get(url, queries, headers=None, verbose=False):
    START_TIME = default_timer()
    loop = asyncio.get_event_loop()
    if loop.is_running():
        future = asyncio.ensure_future(async_getter(url, 
                                            queries, 
                                            headers=headers, 
                                            verbose=verbose)
                              )
        return future
    else:
        result = loop.run_until_complete(async_getter(url, 
                                                      queries, 
                                                      headers=headers, 
                                                      verbose=verbose)
                                        )
        return result
